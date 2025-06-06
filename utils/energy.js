import { off, onValue, ref } from "firebase/database";
import { db } from "../firebase/firebaseConfig";

const timeStrToSeconds = (str) => {
  const [h, m, s] = str.split("_").map(Number);
  return h * 3600 + m * 60 + s;
};

export const computeTotalKWh = (usageData) => {
  const entries = Object.entries(usageData || {}).sort(([a], [b]) => a.localeCompare(b));
  let totalKWh = 0;

  for (let i = 0; i < entries.length - 1; i++) {
    const [time1, data1] = entries[i];
    const [time2] = entries[i + 1];
    const power = data1?.power || 0;
    const t1 = timeStrToSeconds(time1);
    const t2 = timeStrToSeconds(time2);
    totalKWh += (power * (t2 - t1)) / 3600000;
  }

  return Number(totalKWh.toFixed(6));
};

export const streamLiveKWh = (userId, deviceId, applianceName, setApplianceKWh) => {
  const today = new Date().toISOString().split("T")[0];
  const usageRef = ref(db, `/usage/${userId}/${deviceId}/${applianceName}/${today}`);

  const callback = (snapshot) => {
    const usage = snapshot.val();
    const kWh = computeTotalKWh(usage);

    setApplianceKWh((prev) => ({
      ...prev,
      [applianceName]: kWh,
    }));
  };

  onValue(usageRef, callback);

  return () => off(usageRef, "value", callback);
};