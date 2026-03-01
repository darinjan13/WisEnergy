import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { ref, onValue, off } from "firebase/database";
import { timeAgo } from "@/utils/dateHelper";

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
            setIsOnline(now - lastSeenTs <= 10);
        };

        onValue(presenceRef, handler);

        // ← re-check every 5 seconds locally
        const interval = setInterval(() => {
            setLastSeen(prev => {
                if (prev) {
                    const now = Math.floor(Date.now() / 1000);
                    setIsOnline(now - Math.floor(prev / 1000) <= 10);
                }
                return prev;
            });
        }, 5000);

        return () => {
            off(presenceRef, "value", handler);
            clearInterval(interval);
        };
    }, [deviceData?.id]);
    useEffect(() => {
        setToggleValue(deviceData?.relay_desired ?? false);
    }, [deviceData?.relay_desired]);

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
                    </View>
                </TouchableOpacity>

                {/* RIGHT SIDE */}
                <View className="items-end">

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
                    <View className="flex-row items-center gap-x-4">
                        <TouchableOpacity
                            testID="edit-button"
                            activeOpacity={0.8}
                            onPress={() => !isDisabled && editDevice()}
                            disabled={isDisabled}
                            className={`w-10 h-10 rounded-full items-center justify-center`}
                        >
                            <Feather name="edit" size={20} color={isDisabled ? "#9CA3AF" : "#2E4F4F"} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="delete-button"
                            activeOpacity={0.8}
                            onPress={() => !isDisabled && deleteDevice()}
                            disabled={isDisabled}
                            className={`w-10 h-10 rounded-full items-center justify-center`}
                        >
                            <MaterialCommunityIcons name="trash-can" size={20} color={isDisabled ? "#9CA3AF" : "#DC2626"} />
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </View>
    );
}