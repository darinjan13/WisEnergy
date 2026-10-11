import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, Pressable, Dimensions } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { db, auth } from "@/firebase/firebaseConfig";
import { ref, onValue, off, update } from "firebase/database";
import { timeAgo } from "@/utils/dateHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { approve_firmware } from "@/services/apiService";
import { resetDeviceHistory } from "@/services/firebaseDevicesService";
import ResultModal from "@/components/ui/ResultModal";

export default function DeviceCard({
    disabled,
    onPress,
    deviceData,
    editDevice,
    deleteDevice,
    onToggle,
}) {
    const isUnpaired = deviceData?.status === "unpaired";
    const isReady = deviceData?.ready === true;
    const isDisabled = disabled || isUnpaired;
    const [toggleValue, setToggleValue] = useState(deviceData?.relay_desired ?? false);
    const [isToggling, setIsToggling] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [lastSeen, setLastSeen] = useState(null);
    const [live, setLive] = useState(null);
    const [latestFw, setLatestFw] = useState(null);
    const [fwBusy, setFwBusy] = useState(false);
    const [snoozed, setSnoozed] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuAnchorY, setMenuAnchorY] = useState(120);
    const [resetResult, setResetResult] = useState(null);
    const mode = deviceData?.mode ?? "appliance";
    const openMenu = (e) => {
        try {
            e?.currentTarget?.measure?.((x, y, w, h, pageX, pageY) => {
                if (typeof pageY === "number") setMenuAnchorY(pageY);
                setMenuOpen(true);
            });
        } catch {
            setMenuOpen(true);
        }
    };
    const menuTop = (() => {
        const H = Dimensions.get("window").height;
        return Math.max(80, Math.min(menuAnchorY - 10, H - 400));
    })();

    useEffect(() => {
        if (!deviceData?.id || isUnpaired) return;

        const presenceRef = ref(db, `presence/${deviceData.id}/last_seen`);

        const handler = (snapshot) => {
            if (!snapshot.exists()) {
                setIsOnline(false);
                return;
            }
            const lastSeenTs = snapshot.val();
            setLastSeen(lastSeenTs * 1000);
            const now = Math.floor(Date.now() / 1000);
            setIsOnline(now - lastSeenTs <= 90);
        };

        onValue(presenceRef, handler);

        const liveRef = ref(db, `devices/${deviceData.id}/live`);
        const liveHandler = (snap) => setLive(snap.exists() ? snap.val() : null);
        onValue(liveRef, liveHandler);

        const latestRef = ref(db, `firmware/20A/latest`);
        const latestHandler = (snap) => setLatestFw(snap.exists() ? snap.val() : null);
        onValue(latestRef, latestHandler);
        AsyncStorage.getItem(`@fw_snooze:${deviceData.id}`).then((v) => {
            setSnoozed(v && Date.now() < Number(v));
        });

        // ← re-check every 30 seconds locally (heartbeat is 30s)
        const interval = setInterval(() => {
            setLastSeen(prev => {
                if (prev) {
                    const now = Math.floor(Date.now() / 1000);
                    setIsOnline(now - Math.floor(prev / 1000) <= 90);
                }
                return prev;
            });
        }, 30000);

        return () => {
            off(presenceRef, "value", handler);
            off(liveRef, "value", liveHandler);
            off(latestRef, "value", latestHandler);
            clearInterval(interval);
        };
    }, [deviceData?.id]);
    useEffect(() => {
        setToggleValue(deviceData?.relay_desired ?? false);
    }, [deviceData?.relay_desired]);

    const running = deviceData?.fw?.running ?? "0.0.0";
    const fwState = deviceData?.fw?.state ?? "idle";
    const fwProgress = deviceData?.fw?.progress ?? 0;
    const cmpVer = (a, b) => {
        const pa = String(a).split(".").map(Number), pb = String(b).split(".").map(Number);
        for (let i = 0; i < 3; i++) { if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1; }
        return 0;
    };
    const updateReady = latestFw?.version && cmpVer(running, latestFw.version) < 0 && !snoozed;
    const onUpdateTap = async () => {
        if (fwBusy) return;
        setFwBusy(true);
        const r = await approve_firmware(auth?.currentUser?.uid, deviceData.id, latestFw.version);
        setFwBusy(false);
        if (!r.success) alert(r.message);
    };
    const onLaterTap = () => {
        AsyncStorage.setItem(`@fw_snooze:${deviceData.id}`, String(Date.now() + 24 * 3600 * 1000));
        setSnoozed(true);
    };
    const onResetTap = () => {
        setMenuOpen(false);
        Alert.alert(
            "Reset device data?",
            "Deletes ALL history for this device (readings, summaries, kWh). Cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        const { failed } = await resetDeviceHistory(auth?.currentUser?.uid, deviceData.id);
                        setResetResult(
                            failed.length === 0
                                ? { success: true, title: "Device history cleared", lines: ["All readings, summaries, and kWh for this device were removed."] }
                                : { success: false, title: "Partially cleared", lines: ["These refused to delete:", ...failed] }
                        );
                    },
                },
            ]
        );
    };

    return (
        <View
            className={`bg-white rounded-2xl p-4 mb-4 shadow ${disabled ? "opacity-60" : "opacity-100"}`}
        >
            <View className="flex-row items-start justify-between">
                {/* LEFT SIDE */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={disabled}
                    onPress={() => onPress(deviceData)}
                    className="flex-1 pr-3"
                >
                    <Text className="text-[11px] text-gray-500">Device</Text>
                    <Text
                        testID="card"
                        className="font-extrabold text-[#2E4F4F] text-base"
                        numberOfLines={1}
                    >
                        {deviceData?.device_nickname || "Unnamed Device"}
                    </Text>

                    <View className="mt-2">
                        <Text className="text-xs text-gray-600" numberOfLines={1}>
                            ID: {deviceData?.id}
                        </Text>
                        <Text className="text-xs text-gray-600" numberOfLines={1}>
                            Paired on: {deviceData?.paired_at || "-"}
                        </Text>
                    </View>

                    {/* ONLINE STATUS only, removed PAIRED chip */}
                    <View className="mt-3 flex-row items-center gap-x-2">
                        {!isUnpaired && (
                            <View className={`px-2 py-1 rounded-full flex-row items-center gap-x-1 ${isOnline ? "bg-green-50" : "bg-gray-100"}`}>
                                <View className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                                <Text className={`text-[10px] font-semibold ${isOnline ? "text-green-700" : "text-gray-500"}`}>
                                    {isOnline ? "Online" : lastSeen ? timeAgo(lastSeen) : "Offline"}
                                </Text>
                            </View>
                        )}
                        <View className="px-2 py-1 rounded-full bg-blue-50">
                            <Text className="text-[10px] font-semibold text-blue-700">
                                {mode === "room" ? "Whole room" : "One appliance"}
                            </Text>
                        </View>
                    </View>

                    {/* LIVE V/A/W (overwrite-only node, ~3s cadence) */}
                    {!isUnpaired && live && (
                        <View className="mt-3 flex-row items-center gap-x-3">
                            <Text className="text-xs font-bold text-[#2E4F4F]">{live.v?.toFixed?.(1) ?? live.v} V</Text>
                            <Text className="text-xs font-bold text-[#2E4F4F]">{live.a?.toFixed?.(2) ?? live.a} A</Text>
                            <Text className="text-[10px] text-gray-500">
                                {live.t ? `live ${Math.max(0, Math.floor(Date.now() / 1000) - live.t)}s ago` : ""}
                            </Text>
                        </View>
                    )}

                    {/* FIRMWARE UPDATE banner */}
                    {!isUnpaired && updateReady && (
                        <View className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                            <Text className="text-xs font-bold text-amber-800">
                                Update {running} → {latestFw.version} available
                            </Text>
                            {fwState === "downloading" || fwState === "updating" ? (
                                <Text className="text-[11px] text-amber-700 mt-1">
                                    {fwState === "downloading" ? `Downloading… ${fwProgress}%` : "Installing…"}
                                </Text>
                            ) : fwState === "error" ? (
                                <Text className="text-[11px] text-red-600 mt-1">Update failed — tap Update to retry.</Text>
                            ) : null}
                            <View className="flex-row gap-x-2 mt-2">
                                <TouchableOpacity onPress={onUpdateTap} disabled={fwBusy}
                                    className="px-3 py-2 rounded-lg bg-amber-600">
                                    <Text className="text-white text-xs font-bold">
                                        {fwBusy ? "Working…" : fwState === "error" ? "Retry" : "Update"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onLaterTap} className="px-3 py-2 rounded-lg bg-gray-200">
                                    <Text className="text-gray-700 text-xs font-bold">Later</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

                {/* RIGHT SIDE */}
                <View className="items-end relative">
                    <TouchableOpacity
                        testID="card-menu-button"
                        activeOpacity={0.8}
                        onPress={openMenu}
                        className="w-10 h-10 rounded-full items-center justify-center"
                    >
                        <Feather name="more-vertical" size={20} color="#2E4F4F" />
                    </TouchableOpacity>
                    {menuOpen && (
                        <Modal
                            transparent
                            visible={menuOpen}
                            animationType="fade"
                            onRequestClose={() => setMenuOpen(false)}
                        >
                            <Pressable
                                onPress={() => setMenuOpen(false)}
                                className="flex-1 justify-start items-end bg-black/30 pr-6"
                                style={{ paddingTop: menuTop }}
                            >
                                <Pressable
                                    testID="card-menu"
                                    className="w-52 bg-white rounded-xl border border-gray-200 p-2 shadow-lg"
                                >
                            <TouchableOpacity
                                testID="menu-edit-button"
                                className="px-3 py-2 rounded-lg"
                                onPress={() => { setMenuOpen(false); !isDisabled && editDevice(); }}
                            >
                                <Text className="text-sm text-gray-800">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID="menu-delete-button"
                                className="px-3 py-2 rounded-lg"
                                onPress={() => { setMenuOpen(false); !isDisabled && deleteDevice(); }}
                            >
                                <Text className="text-sm text-red-600">Delete</Text>
                            </TouchableOpacity>
                            <View className="h-px bg-gray-200 my-1" />
                            <Text className="px-3 pt-1 text-[10px] font-bold text-gray-500">MONITORS</Text>
                            {["appliance", "room"].map((m) => (
                                <TouchableOpacity
                                    key={m}
                                    className="px-3 py-2 rounded-lg flex-row items-center gap-x-2"
                                    disabled={isDisabled}
                                    onPress={() => {
                                        if (mode !== m) update(ref(db, `devices/${deviceData.id}`), { mode: m });
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={mode === m ? "radiobox-marked" : "radiobox-blank"}
                                        size={18}
                                        color={mode === m ? "#2E4F4F" : "#9CA3AF"}
                                    />
                                    <Text className="text-sm text-gray-800">
                                        {m === "room" ? "Whole room" : "One appliance"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <View className="h-px bg-gray-200 my-1" />
                            <TouchableOpacity
                                testID="menu-reset-button"
                                className="px-3 py-2 rounded-lg"
                                onPress={onResetTap}
                            >
                                <Text className="text-sm text-red-600">Reset data…</Text>
                            </TouchableOpacity>
                                </Pressable>
                            </Pressable>
                        </Modal>
                    )}

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={async () => {
                            if (isDisabled || !onToggle || isToggling || !isOnline || !isReady) return;
                            const next = !toggleValue;
                            setToggleValue(next);
                            setIsToggling(true);
                            await onToggle(next, deviceData);
                            setTimeout(() => setIsToggling(false), 3000);
                        }}
                        disabled={isDisabled || !onToggle || isToggling || !isOnline || !isReady}
                        className={`mt-3 w-12 h-12 rounded-full items-center justify-center ${isDisabled || !isOnline || !isReady ? "bg-gray-100" : toggleValue ? "bg-green-700" : "bg-gray-200"
                            }`}
                    >
                        {isToggling ? (
                            <ActivityIndicator size="small" color={toggleValue ? "#ffffff" : "#6B7280"} />
                        ) : (
                            <MaterialCommunityIcons
                                name="power"
                                size={26}
                                color={isDisabled || !isOnline || !isReady ? "#9CA3AF" : toggleValue ? "#ffffff" : "#6B7280"}
                            />
                        )}
                    </TouchableOpacity>

                </View>
            </View>
            <ResultModal
                visible={!!resetResult}
                success={resetResult?.success ?? true}
                title={resetResult?.title ?? ""}
                lines={resetResult?.lines ?? []}
                onClose={() => setResetResult(null)}
            />
        </View>
    );
}