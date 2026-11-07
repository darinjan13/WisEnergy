import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ResultModal from "@/components/ui/ResultModal";
import { auth } from "@/firebase/firebaseConfig";
import { clearDeviceData, listUsageDates } from "@/services/firebaseDevicesService";

const today = () => new Date().toISOString().slice(0, 10);

/* One reset entry point per device: pick the scope (all / last N days / specific
   days) and what to include (raw readings, daily summaries, weekly+monthly
   rollups, kWh counters). Confirmation is explicit and lists exactly what goes. */
export default function ClearDeviceDataSheet({
  visible,
  deviceId,
  deviceLabel,
  onClose,
  onDone,
}) {
  const todayIso = today();
  const [dates, setDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [scope, setScope] = useState("all");
  const [picked, setPicked] = useState([]);
  const [include, setInclude] = useState({
    usage: true,
    daily: true,
    rollups: true,
    kwh: false,
  });
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setScope("all");
    setPicked([]);
    setDialog(null);
    setInclude({ usage: true, daily: true, rollups: true, kwh: false });
    let cancelled = false;
    (async () => {
      setLoadingDates(true);
      try {
        const { dates: found } = await listUsageDates(auth.currentUser?.uid, deviceId);
        if (!cancelled) setDates(found);
      } catch {
        if (!cancelled) setDates([]);
      } finally {
        if (!cancelled) setLoadingDates(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, deviceId]);

  const past = useMemo(() => dates.filter((d) => d < todayIso), [dates, todayIso]);

  const toggleDate = (d) =>
    setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const toggleInclude = (key) => setInclude((s) => ({ ...s, [key]: !s[key] }));

  const nothingSelected =
    !include.usage && !include.daily && !include.rollups && !include.kwh;

  const canReview =
    !nothingSelected && (scope !== "days" || picked.length > 0) && !busy;

  const scopeLabel = useMemo(() => {
    if (scope === "all") return "All history";
    if (scope === "today") return "Today";
    if (scope === "7") return "Last 7 days";
    if (scope === "30") return "Last 30 days";
    return `${picked.length} selected day(s)`;
  }, [scope, picked.length]);

  const includeLabels = useMemo(() => {
    const out = [];
    if (include.usage) out.push("raw readings");
    if (include.daily) out.push("daily summaries");
    if (include.rollups) out.push("weekly + monthly summaries");
    if (include.kwh) out.push("kWh counters");
    return out;
  }, [include]);

  const review = () => {
    setDialog({
      kind: "confirm",
      title: `Clear ${scopeLabel.toLowerCase()}?`,
      lines: [
        `Removes: ${includeLabels.join(", ")}.`,
        scope === "days" || scope === "today"
          ? `Days: ${(scope === "today" ? [todayIso] : picked).join(", ")}`
          : "The device keeps writing new readings immediately.",
        scope === "today"
          ? "Today is re-written while the device keeps reporting."
          : "Cannot be undone.",
      ],
    });
  };

  const run = async () => {
    const uid = auth.currentUser?.uid;
    try {
      setBusy(true);
      const includeMap = {
        usage: include.usage,
        daily: include.daily,
        rollups: include.rollups,
        kwh: include.kwh,
      };
      const useDays = scope !== "all";
      let list = null;
      if (scope === "today") list = [todayIso];
      else if (scope === "7") list = past.slice(-7);
      else if (scope === "30") list = past.slice(-30);
      else if (scope === "days") list = picked;

      if (useDays && list.length === 0) {
        setDialog({
          kind: "result",
          success: false,
          title: "Nothing to clear",
          lines: ["No days matched that scope."],
        });
        return;
      }

      const res = await clearDeviceData(uid, deviceId, {
        dates: useDays ? list : null,
        include: includeMap,
      });

      if (res.failed.length === 0) {
        setDialog({
          kind: "result",
          success: true,
          title: scopeLabel === "All history" ? "Device data cleared" : `Cleared ${scopeLabel.toLowerCase()}`,
          lines: [
            `Removed: ${includeLabels.join(", ")}.`,
            "The list below has been refreshed.",
          ],
        });
        if (onDone) await onDone();
      } else {
        setDialog({
          kind: "result",
          success: false,
          title: "Partially cleared",
          lines: ["These refused to delete:", ...res.failed],
        });
      }
    } catch (e) {
      setDialog({
        kind: "result",
        success: false,
        title: "Clear failed",
        lines: [e?.code || e?.message || "Unknown error"],
      });
    } finally {
      setBusy(false);
    }
  };

  const Row = ({ k, icon, label, hint }) => (
    <TouchableOpacity
      onPress={() => toggleInclude(k)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: include[k] }}
      className="flex-row items-center py-2.5"
    >
      <MaterialCommunityIcons
        name={include[k] ? "checkbox-marked" : "checkbox-blank-outline"}
        size={20}
        color={include[k] ? "#DC2626" : "#9CA3AF"}
      />
      <View className="ml-2 flex-1">
        <Text className="text-sm font-semibold text-gray-800">{label}</Text>
        {hint ? <Text className="text-xs text-gray-500">{hint}</Text> : null}
      </View>
      <MaterialCommunityIcons name={icon} size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const seg = (key, label) => {
    const on = scope === key;
    return (
      <TouchableOpacity
        key={key}
        onPress={() => {
          setScope(key);
          if (key === "today") setPicked([todayIso]);
          if (key === "7") setPicked(past.slice(-7));
          if (key === "30") setPicked(past.slice(-30));
        }}
        className={`flex-1 py-2 rounded-lg items-center ${on ? "bg-red-600" : "bg-gray-100"}`}
      >
        <Text className={`text-xs font-semibold ${on ? "text-white" : "text-gray-700"}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Modal visible={visible && !dialog} transparent animationType="fade" onRequestClose={onClose}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-bold text-gray-800">Reset device data</Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
                <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500 mb-3">
              {deviceLabel ? `For ${deviceLabel}. ` : ""}Pick a range, then what to remove. Clearing
              today only sticks while the device is off — it re-writes today while reporting.
            </Text>

            <Text className="text-xs font-bold uppercase text-gray-400 mb-2">Range</Text>
            <View className="flex-row gap-x-2 mb-3">
              {seg("all", "All")}
              {seg("today", "Today")}
              {seg("7", "7d")}
              {seg("30", "30d")}
              {seg("days", "Pick")}
            </View>

            {scope === "days" && (
              loadingDates ? (
                <Text className="text-xs text-gray-400 py-4 text-center">Loading days…</Text>
              ) : dates.length === 0 ? (
                <Text className="text-xs text-gray-400 py-4 text-center">
                  No readings found for this device yet.
                </Text>
              ) : (
                <ScrollView className="max-h-40 mb-3">
                  <View className="flex-row flex-wrap gap-2">
                    {[...dates].reverse().map((d) => {
                      const on = picked.includes(d);
                      const isToday = d === todayIso;
                      return (
                        <TouchableOpacity
                          key={d}
                          onPress={() => toggleDate(d)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          className={`px-2.5 py-1.5 rounded-lg border ${
                            on ? "bg-red-50 border-red-400" : "bg-white border-gray-300"
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${on ? "text-red-700" : "text-gray-700"}`}
                          >
                            {d.slice(5)}
                            {isToday ? " (today)" : ""}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )
            )}

            <Text className="text-xs font-bold uppercase text-gray-400 mb-1 mt-1">Include</Text>
            <Row k="usage" icon="database-outline" label="Raw readings" hint="usage/ — the per-second samples" />
            <Row k="daily" icon="calendar-today" label="Daily summaries" hint="daily_summary/" />
            <Row k="rollups" icon="calendar-week" label="Weekly + monthly summaries" hint="regenerated by the backend" />
            <Row k="kwh" icon="counter" label="kWh counters" hint="latest_kwh — live counter, off by default" />

            {nothingSelected && (
              <Text className="text-xs text-red-600 mt-1">Select at least one thing to remove.</Text>
            )}

            <View className="flex-row gap-x-2 mt-4">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-300 items-center"
              >
                <Text className="text-sm font-bold text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!canReview}
                onPress={review}
                style={{ opacity: canReview ? 1 : 0.5, flex: 2 }}
                className="py-3 rounded-xl bg-red-600 items-center"
              >
                <Text className="text-sm font-bold text-white">
                  {busy ? "Working…" : "Review & reset"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ResultModal
        visible={!!dialog}
        mode={dialog?.kind === "confirm" ? "confirm" : "result"}
        success={dialog?.success ?? true}
        title={dialog?.title ?? ""}
        lines={dialog?.lines ?? []}
        confirmText="Reset"
        onConfirm={run}
        onClose={() => {
          setDialog(null);
          if (dialog?.kind === "result") onClose();
        }}
      />
    </>
  );
}
