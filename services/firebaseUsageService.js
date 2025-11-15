import {
  get,
  limitToLast,
  off,
  onValue,
  orderByKey,
  query,
  ref,
} from "firebase/database";
import { db } from "../firebase/firebaseConfig";
import { getLastNDays, getMonthName } from "../utils/dateHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as predictionServices from "./apiService";
import { format } from "date-fns-tz";

/* ---------------------------------------------------------
   🔥 Utility: yield to event loop (prevents JS freeze)
--------------------------------------------------------- */
const microtask = () => new Promise((resolve) => setTimeout(resolve, 0));

/* ---------------------------------------------------------
   🔥 Non-blocking AsyncStorage write
--------------------------------------------------------- */
const safeSetItem = (key, value) => {
  setTimeout(() => {
    AsyncStorage.setItem(key, value);
  }, 0);
};

/* ---------------------------------------------------------
   🔥 Real-time Listener: Latest POWER
--------------------------------------------------------- */
export const listenToLatestPower = (
  userId,
  deviceId,
  applianceName,
  date,
  callback
) => {
  const powerRef = ref(
    db,
    `usage/${userId}/${deviceId}/${applianceName}/${date}`
  );
  const q = query(powerRef, orderByKey(), limitToLast(1));

  const unsub = onValue(q, (snapshot) => {
    let val = 0;
    snapshot.forEach((snap) => {
      val = snap.val()?.power || 0;
    });
    callback(val);
  });

  return unsub;
};

/* ---------------------------------------------------------
   🔥 Real-time Listener: Latest KWH
--------------------------------------------------------- */
export const listenToLatestKwh = (
  userId,
  deviceId,
  applianceName,
  callback
) => {
  const kwhRef = ref(
    db,
    `appliances/${userId}/${deviceId}/${applianceName}/latest_kwh`
  );

  const unsub = onValue(kwhRef, (snapshot) => {
    callback(snapshot.val() ?? 0);
  });

  return unsub;
};

/* ---------------------------------------------------------
   🔥 Fetch: Today's Hourly Trend (optimized)
--------------------------------------------------------- */
export const fetchTodayTrend = async (userId) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd", {
      timeZone: "Asia/Manila",
    });

    const refSummary = ref(db, `daily_summary/${userId}`);
    const snapshot = await get(refSummary);
    if (!snapshot.exists()) return null;

    const buckets = {
      "12am-4am": 0,
      "4am-8am": 0,
      "8am-12pm": 0,
      "12pm-4pm": 0,
      "4pm-8pm": 0,
      "8pm-12am": 0,
    };

    const hourlyData = Object.fromEntries(
      Array.from({ length: 24 }).map((_, h) => [
        `${String(h).padStart(2, "0")}:00`,
        0,
      ])
    );

    const raw = snapshot.val();
    for (const device of Object.values(raw)) {
      await microtask();

      for (const appliance of Object.values(device)) {
        const todayNode = appliance?.[today];
        if (!todayNode?.hourly) continue;

        for (const [hourKey, rawVal] of Object.entries(todayNode.hourly)) {
          const hour = parseInt(hourKey.split(":")[0]);
          const value = Number(rawVal) || 0;

          hourlyData[hourKey] += value;

          if (hour < 4) buckets["12am-4am"] += value;
          else if (hour < 8) buckets["4am-8am"] += value;
          else if (hour < 12) buckets["8am-12pm"] += value;
          else if (hour < 16) buckets["12pm-4pm"] += value;
          else if (hour < 20) buckets["4pm-8pm"] += value;
          else buckets["8pm-12am"] += value;
        }
      }
    }

    const cacheKey = `@todayTrend:${userId}:${today}`;
    const now = new Date();
    const h = now.getHours();
    let nextBlock = (Math.ceil((h + 1) / 4) * 4) % 24;

    const cutoff = new Date(now);
    cutoff.setHours(nextBlock, 0, 0, 0);
    if (nextBlock <= h) cutoff.setDate(cutoff.getDate() + 1);

    const data = { buckets, hourlyData };

    safeSetItem(
      cacheKey,
      JSON.stringify({ data, expiresAt: cutoff.getTime() })
    );

    return data;
  } catch (e) {
    console.error("❌ fetchTodayTrend:", e);
    return null;
  }
};

/* ---------------------------------------------------------
   🔥 Fetch: Top Appliances (cached)
--------------------------------------------------------- */
export const fetchTopAppliances = async (userId, limit = 5) => {
  const key = `@overall_top_appliances:${userId}`;

  const cached = await AsyncStorage.getItem(key);
  if (cached) return JSON.parse(cached).data;

  const refSum = ref(db, `daily_summary/${userId}`);
  const snapshot = await get(refSum);

  if (!snapshot.exists()) return [];

  const totals = {};
  snapshot.forEach((dev) => {
    dev.forEach((app) => {
      const name = app.key;
      app.forEach((dateSnap) => {
        const k = dateSnap.child("total_kWh").val() || 0;
        totals[name] = (totals[name] || 0) + k;
      });
    });
  });

  const arr = Object.entries(totals)
    .map(([name, kwh]) => ({
      name,
      kwh: Number(kwh.toFixed(2)),
    }))
    .sort((a, b) => b.kwh - a.kwh)
    .slice(0, limit);

  safeSetItem(key, JSON.stringify({ data: arr }));
  return arr;
};

/* ---------------------------------------------------------
   🔥 Fetch All Latest KWH for one device
--------------------------------------------------------- */
export const fetchAllLatestKwh = async (userId, deviceId) => {
  const refPath = ref(db, `appliances/${userId}/${deviceId}`);
  const snap = await get(refPath);

  if (!snap.exists()) return {};

  const res = {};
  const data = snap.val();
  for (const [name, body] of Object.entries(data)) {
    res[name] = body?.latest_kwh ?? 0;
  }
  return res;
};

/* ---------------------------------------------------------
   🔥 Monthly Total Consumption (single month)
--------------------------------------------------------- */
export const fetchLatestMonthlyTotalConsumption = async (userId) => {
  try {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");

    const refPath = ref(
      db,
      `monthly_total_consumption/${userId}/${y}/${m}/total_energy_consumption`
    );

    const snap = await get(refPath);
    return snap.exists() ? snap.val() : 0;
  } catch {
    return 0;
  }
};

/* ---------------------------------------------------------
   🔥 DAILY REPORT (per device per appliance)
--------------------------------------------------------- */
export const fetchDailyReport = async (userId, deviceId, appliances) => {
  const dates = getLastNDays(7);
  const output = [];

  for (const appliance of appliances) {
    const history = [];

    for (const date of dates) {
      await microtask();
      const path = `daily_summary/${userId}/${deviceId}/${appliance.name}/${date}`;
      const snap = await get(ref(db, path));
      const kwh = Number((snap.val()?.total_kWh ?? 0).toFixed(2));

      history.push({ label: date.slice(5), value: kwh, dataPointText: kwh });
    }

    const pred = await predictionServices.predict_usage(
      userId,
      deviceId,
      appliance.name
    );

    const barData2 = Array.isArray(pred?.daily)
      ? pred.daily.map((p) => ({
          label: p.label,
          value: p.value,
          dataPointText: p.value,
        }))
      : [];

    output.push({
      applianceName: appliance.name,
      latestKwh: history.at(-1)?.value ?? 0,
      barData: history,
      barData2,
    });
  }

  return output;
};

/* ---------------------------------------------------------
   🔥 WEEKLY REPORT
--------------------------------------------------------- */
export const fetchWeeklyReport = async (userId, deviceId, appliances) => {
  const now = new Date();
  const year = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const pm = String(now.getMonth()).padStart(2, "0");

  const output = [];

  for (const appliance of appliances) {
    await microtask();

    const ref1 = ref(
      db,
      `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${m}`
    );
    const snap1 = await get(ref1);

    const data1 = snap1.exists() ? snap1.val() : {};
    const weeks = Object.keys(data1).sort();

    let history = weeks.map((w) => {
      const d = data1[w];
      const val = Number((d?.total_kWh ?? 0).toFixed(2));

      return {
        label: `W${w}-${m}`,
        value: val,
        dataPointText: val,
        date: `${d.start_date?.replace(`${year}-`, "")} - ${d.end_date?.replace(
          `${year}-`,
          ""
        )}`,
        month: m,
      };
    });

    // include previous month last week if needed
    if (history.length < 2 && pm !== "00") {
      const ref2 = ref(
        db,
        `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${pm}`
      );
      const snap2 = await get(ref2);

      if (snap2.exists()) {
        const pdata = snap2.val();
        const last = Object.keys(pdata).sort().at(-1);

        if (last) {
          const d = pdata[last];
          const val = Number((d?.total_kWh ?? 0).toFixed(2));
          history.unshift({
            label: `W${last}-${pm}`,
            value: val,
            dataPointText: val,
            date: `${d.start_date?.replace(
              `${year}-`,
              ""
            )} - ${d.end_date?.replace(`${year}-`, "")}`,
            month: pm,
          });
        }
      }
    }

    history.sort((a, b) => {
      const [wa, ma] = a.label.replace("W", "").split("-");
      const [wb, mb] = b.label.replace("W", "").split("-");
      return ma === mb ? Number(wa) - Number(wb) : Number(ma) - Number(mb);
    });

    const pred = await predictionServices.predict_usage(
      userId,
      deviceId,
      appliance.name
    );
    const barData2 = Array.isArray(pred?.weekly)
      ? pred.weekly.map((p) => ({
          label: p.label,
          value: p.value,
          dataPointText: p.value,
        }))
      : [];

    output.push({
      applianceName: appliance.name,
      latestKwh: history.at(-1)?.value ?? 0,
      barData: history,
      barData2,
    });
  }

  return output;
};

/* ---------------------------------------------------------
   🔥 MONTHLY REPORT
--------------------------------------------------------- */
export const fetchMonthlyReport = async (userId, deviceId, appliances) => {
  const year = new Date().getFullYear().toString();
  const output = [];

  for (const appliance of appliances) {
    await microtask();

    const ref1 = ref(
      db,
      `monthly_summary/${userId}/${deviceId}/${appliance.name}/${year}`
    );
    const snap = await get(ref1);
    const data = snap.exists() ? snap.val() : {};

    const months = Object.keys(data).sort((a, b) => Number(b) - Number(a));

    const history = months.map((m) => {
      const v = Number((data[m]?.total_kWh ?? 0).toFixed(2));
      return {
        label: getMonthName(m, "short"),
        value: v,
        dataPointText: v,
      };
    });

    const pred = await predictionServices.predict_usage(
      userId,
      deviceId,
      appliance.name
    );
    const barData2 = Array.isArray(pred?.monthly)
      ? pred.monthly.map((p) => ({
          label: getMonthName(p.label, "short"),
          value: p.value,
          dataPointText: p.value,
        }))
      : [];

    output.push({
      applianceName: appliance.name,
      latestKwh: history.at(-1)?.value ?? 0,
      barData: history,
      barData2,
    });
  }

  return output;
};

/* ---------------------------------------------------------
   🔥 DAILY TOTAL
--------------------------------------------------------- */
export const fetchDailyTotalConsumption = async (userId) => {
  try {
    const dates = getLastNDays(7);
    const history = [];

    for (const d of dates) {
      await microtask();

      const refP = ref(db, `daily_total_consumption/${userId}/${d}`);
      const snap = await get(refP);

      const total = Number(
        (snap.val()?.total_energy_consumption ?? 0).toFixed(2)
      );

      history.push({
        label: d.slice(5),
        value: total,
        dataPointText: total,
        date: d,
      });
    }

    const pred = await predictionServices.predict_totals(userId);
    const barData2 = Array.isArray(pred?.daily)
      ? pred.daily.map((p) => ({
          label: p.label,
          value: p.value,
          dataPointText: p.value,
        }))
      : [];

    return [
      {
        title: "Daily Total Consumption",
        latestKwh: history.at(-1)?.value ?? 0,
        barData: history,
        barData2,
      },
    ];
  } catch (e) {
    console.error("❌ Daily total error:", e);
    return [];
  }
};

/* ---------------------------------------------------------
   🔥 WEEKLY TOTAL
--------------------------------------------------------- */
export const fetchWeeklyTotalConsumption = async (userId) => {
  try {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const pm = String(now.getMonth()).padStart(2, "0");

    const ref1 = ref(db, `weekly_total_consumption/${userId}/${y}/${m}`);
    const snap1 = await get(ref1);

    const data1 = snap1.exists() ? snap1.val() : {};
    let history = Object.keys(data1)
      .sort()
      .map((w) => {
        const d = data1[w];
        const val = Number((d?.total_energy_consumption ?? 0).toFixed(2));
        return {
          label: `W${w}-${m}`,
          value: val,
          dataPointText: val,
          date: `${d.start_date?.replace(`${y}-`, "")} - ${d.end_date?.replace(
            `${y}-`,
            ""
          )}`,
        };
      });

    if (history.length < 1 && pm !== "00") {
      const ref2 = ref(db, `weekly_total_consumption/${userId}/${y}/${pm}`);
      const snap2 = await get(ref2);

      if (snap2.exists()) {
        const pdata = snap2.val();
        const last = Object.keys(pdata).sort().at(-1);
        if (last) {
          const d = pdata[last];
          const v = Number((d?.total_energy_consumption ?? 0).toFixed(2));
          history.unshift({
            label: `W${last}-${pm}`,
            value: v,
            dataPointText: v,
            date: `${d.start_date?.replace(
              `${y}-`,
              ""
            )} - ${d.end_date?.replace(`${y}-`, "")}`,
          });
        }
      }
    }

    const pred = await predictionServices.predict_totals(userId);
    const barData2 = Array.isArray(pred?.weekly)
      ? pred.weekly.map((p) => ({
          label: p.label,
          value: p.value,
          dataPointText: p.value,
        }))
      : [];

    return [
      {
        title: "Weekly Total Consumption",
        barData: history,
        barData2,
        latestKwh: history.at(-1)?.value ?? 0,
      },
    ];
  } catch (e) {
    console.error("❌ Weekly total error:", e);
    return [];
  }
};

/* ---------------------------------------------------------
   🔥 MONTHLY TOTAL (all months)
--------------------------------------------------------- */
export const fetchMonthlyTotalConsumption = async (userId) => {
  const y = new Date().getFullYear().toString();
  const refPath = ref(db, `monthly_total_consumption/${userId}/${y}`);
  const snap = await get(refPath);

  if (!snap.exists()) return [];

  const raw = snap.val();
  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const months = Object.keys(raw)
    .map((m) => Number(m))
    .sort((a, b) => a - b)
    .map((m) => m.toString().padStart(2, "0"));

  const history = months.map((month) => {
    const d = raw[month];
    const v = Number((d?.total_energy_consumption ?? 0).toFixed(2));
    return {
      label: getMonthName(month, "short"),
      value: v,
      dataPointText: v,
      date: `${d.start_date ?? ""} - ${d.end_date ?? ""}`,
    };
  });

  const pred = await predictionServices.predict_totals(userId);

  const barData2 = Array.isArray(pred?.monthly)
    ? pred.monthly.map((p) => ({
        label: getMonthName(p.label, "short"),
        value: p.value,
        dataPointText: p.value,
        monthIndex: monthOrder.indexOf(getMonthName(p.label, "short")),
      }))
    : [];

  barData2.sort((a, b) => a.monthIndex - b.monthIndex);

  return [
    {
      title: "Monthly Total Consumption",
      barData: history,
      barData2,
    },
  ];
};

/* ---------------------------------------------------------
   🔥 Today's raw total
--------------------------------------------------------- */
export const fetchDailyKwh = async (userId) => {
  const todayStr = format(new Date(), "yyyy-MM-dd", {
    timeZone: "Asia/Manila",
  });

  const snap = await get(
    ref(db, `daily_total_consumption/${userId}/${todayStr}`)
  );

  return snap.exists() ? snap.val()?.total_energy_consumption ?? 0 : 0;
};

/* ---------------------------------------------------------
   🔥 ALL monthly totals (sorted)
--------------------------------------------------------- */
export const fetchAllMonthlyTotalConsumption = async (userId) => {
  const y = new Date().getFullYear().toString();
  const snap = await get(ref(db, `monthly_total_consumption/${userId}/${y}`));
  const data = snap.exists() ? snap.val() : {};

  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const months = Object.keys(data)
    .map((m) => Number(m))
    .sort((a, b) => a - b)
    .map((m) => m.toString().padStart(2, "0"));

  const monthlyTotals = months.map((m) => ({
    label: getMonthName(m, "short"),
    value: Number((data[m]?.total_energy_consumption ?? 0).toFixed(2)),
    dataPointText: Number((data[m]?.total_energy_consumption ?? 0).toFixed(2)),
  }));

  monthlyTotals.sort(
    (a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label)
  );

  return monthlyTotals;
};
