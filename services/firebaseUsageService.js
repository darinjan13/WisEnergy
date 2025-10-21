import { get, limitToLast, off, onValue, orderByKey, query, ref } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { getLastNDays, getMonthName } from '../utils/dateHelper'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as predictionServices from './apiService'
import { format } from "date-fns-tz";

export const listenToLatestPower = (userId, deviceId, applianceName, date, callback) => {
    const powerRef = ref(db, `usage/${userId}/${deviceId}/${applianceName}/${date}`);
    const latestPowerQuery = query(powerRef, orderByKey(), limitToLast(1));

    // ✅ Correct usage
    const unsubscribe = onValue(latestPowerQuery, (snapshot) => {
        let latestPower = null;
        snapshot.forEach((childSnap) => {
            latestPower = childSnap.val()?.power || 0;
        });
        callback(latestPower);
    });

    // ✅ Proper cleanup
    return unsubscribe;
};

export const listenToLatestKwh = (userId, deviceId, applianceName, callback) => {
    const kwhRef = ref(db, `appliances/${userId}/${deviceId}/${applianceName}/latest_kwh`);

    const unsubscribe = onValue(kwhRef, (snapshot) => {
        callback(snapshot.val());
    });
    return unsubscribe;
};

export const fetchTodayTrend = async (userId) => {
    try {
        const today = format(new Date(), "yyyy-MM-dd", { timeZone: "Asia/Manila" });
        const summaryRef = ref(db, `daily_summary/${userId}`);
        const snapshot = await get(summaryRef);

        if (!snapshot.exists()) {
            console.log("⚠️ No daily summary found.");
            return null;
        }

        const buckets = {
            "12am-4am": 0,
            "4am-8am": 0,
            "8am-12pm": 0,
            "12pm-4pm": 0,
            "4pm-8pm": 0,
            "8pm-12am": 0,
        };

        const hourlyData = {
            "00:00": 0, "01:00": 0, "02:00": 0, "03:00": 0,
            "04:00": 0, "05:00": 0, "06:00": 0, "07:00": 0,
            "08:00": 0, "09:00": 0, "10:00": 0, "11:00": 0,
            "12:00": 0, "13:00": 0, "14:00": 0, "15:00": 0,
            "16:00": 0, "17:00": 0, "18:00": 0, "19:00": 0,
            "20:00": 0, "21:00": 0, "22:00": 0, "23:00": 0,
        };

        snapshot.forEach((deviceSnap) => {
            deviceSnap.forEach((applianceSnap) => {
                const todayData = applianceSnap.child(today);
                if (!todayData.exists()) return;

                const hourly = todayData.child("hourly");
                hourly.forEach((hourSnap) => {
                    const hourKey = hourSnap.key; // e.g. "18:00"
                    const hour = parseInt(hourKey.split(":")[0]);
                    const value = parseFloat(hourSnap.val()) || 0;

                    // store to hourly map
                    if (hourlyData[hourKey] !== undefined) {
                        hourlyData[hourKey] += value;
                    }

                    // accumulate per bucket
                    if (hour >= 0 && hour < 4) buckets["12am-4am"] += value;
                    else if (hour >= 4 && hour < 8) buckets["4am-8am"] += value;
                    else if (hour >= 8 && hour < 12) buckets["8am-12pm"] += value;
                    else if (hour >= 12 && hour < 16) buckets["12pm-4pm"] += value;
                    else if (hour >= 16 && hour < 20) buckets["4pm-8pm"] += value;
                    else if (hour >= 20 && hour < 24) buckets["8pm-12am"] += value;
                });
            });
        });

        // Caching with 4-hour fixed expiry (4am, 8am, etc.)
        const cacheKey = `@todayTrend:${userId}:${today}`;
        const cached = await AsyncStorage.getItem(cacheKey);

        if (cached) {
            const { data, expiresAt } = JSON.parse(cached);
            if (Date.now() < expiresAt) {
                return data; // Return cached data if it's still valid
            }
        }

        const result = { buckets, hourlyData };

        // Calculate the next 4-hour cutoff (4am, 8am, etc.)
        const now = new Date();
        const currentHour = now.getHours();
        let nextCutoffHour = Math.ceil((currentHour + 1) / 4) * 4 % 24;
        const cutoff = new Date(now);
        cutoff.setHours(nextCutoffHour, 0, 0, 0);

        if (nextCutoffHour <= currentHour) {
            cutoff.setDate(cutoff.getDate() + 1); // Set to the next day if it's past the current 4-hour block
        }

        // Save the result in AsyncStorage with expiration at the next 4-hour block
        await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({
                data: result,
                expiresAt: cutoff.getTime(),
            })
        );

        return result;

    } catch (error) {
        console.error("❌ Error fetching today trend:", error);
        return null;
    }
};

export const fetchTopAppliances = async (userId, limit = 5) => {
    const key = `@overall_top_appliances:${userId}`;

    try {
        const cachedStr = await AsyncStorage.getItem(key);
        if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            return cached.data;
        }

        const summaryRef = ref(db, `daily_summary/${userId}`);
        const snapshot = await get(summaryRef);

        if (!snapshot.exists()) {
            console.log("⚠️ No daily summary found for top appliances.");
            return [];
        }

        const totals = {};

        snapshot.forEach((deviceSnap) => {
            deviceSnap.forEach((applianceSnap) => {
                applianceSnap.forEach((dateSnap) => {
                    const total = dateSnap.child("total_kWh").val() || 0;
                    const name = applianceSnap.key;
                    if (!totals[name]) totals[name] = 0;
                    totals[name] += total;
                });
            });
        });

        const appliances = Object.entries(totals).map(([name, kwh]) => ({
            name,
            kwh: Number(kwh.toFixed(2)),
        }));

        const top = appliances.sort((a, b) => b.kwh - a.kwh).slice(0, limit);

        await AsyncStorage.setItem(key, JSON.stringify({ data: top }));

        return top;
    } catch (err) {
        console.error("Error fetching overall top appliances:", err);
        return [];
    }
};

export const fetchAllLatestKwh = async (userId, deviceId) => {
    const deviceRef = ref(db, `appliances/${userId}/${deviceId}`);
    const snapshot = await get(deviceRef);

    if (!snapshot.exists()) {
        return {};
    }

    const data = snapshot.val();
    const results = {};

    Object.entries(data).forEach(([applianceName, applianceData]) => {
        results[applianceName] = applianceData?.latest_kwh ?? 0;
    });

    return results;
};

export const fetchLatestMonthlyTotalConsumption = async (userId) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");

        const monthlyTotalRef = ref(
            db,
            `monthly_total_consumption/${userId}/${year}/${month}/total_energy_consumption`
        );

        const snapshot = await get(monthlyTotalRef);

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Error fetching monthly total consumption:", error);
        return 0;
    }
};

export const fetchDailyReport = async (userId, deviceId, appliances) => {
    const dates = getLastNDays(5);
    const results = [];

    for (const appliance of appliances) {
        const history = [];

        for (const date of dates) {
            const path = `daily_summary/${userId}/${deviceId}/${appliance.name}/${date}`;
            const snap = await get(ref(db, path));
            const val = snap.exists() ? snap.val() : {};
            const kwh = Number((val.total_kWh ?? 0).toFixed(2));
            history.push({ label: date.slice(5), value: kwh, dataPointText: kwh });
        }

        // 🔸 Fetch AI prediction
        const predictions = await predictionServices.predict_usage(userId, deviceId, appliance.name);
        const barData2 = Array.isArray(predictions?.daily)
            ? predictions.daily.map(p => ({
                label: p.label,
                value: p.value,
                dataPointText: p.value
            }))
            : [];

        results.push({
            applianceName: appliance.name,
            latestKwh: history.at(-1)?.value ?? 0,
            barData: history,
            barData2
        });
    }

    return results;
};


/** 🔹 Weekly report per appliance */
export const fetchWeeklyReport = async (userId, deviceId, appliances) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prevMonth = String(now.getMonth()).padStart(2, "0");
    const results = [];

    for (const appliance of appliances) {
        let history = [];

        // 🔹 Fetch current month weeks
        const ref1 = ref(db, `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${month}`);
        const snap1 = await get(ref1);
        const data1 = snap1.exists() ? snap1.val() : {};
        const thisMonthWeeks = Object.keys(data1).sort();

        // 🔹 Convert to chart entries
        const thisMonthHistory = thisMonthWeeks.map((w) => {
            const d = data1[w];
            const val = Number((d?.total_kWh ?? 0).toFixed(2));
            return {
                label: `W${w}-${month}`,
                value: val,
                dataPointText: val,
                date: `${(d.start_date || "").replace(`${year}-`, "")} - ${(d.end_date || "").replace(`${year}-`, "")}`,
                month,
            };
        });

        // 🔹 Fetch last week of previous month (if needed)
        let prevMonthHistory = [];
        if (thisMonthWeeks.length < 2 && prevMonth !== "00") {
            const ref2 = ref(db, `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${prevMonth}`);
            const snap2 = await get(ref2);
            if (snap2.exists()) {
                const prevData = snap2.val();
                const prevWeeks = Object.keys(prevData).sort();
                const lastWeek = prevWeeks.at(-1);
                if (lastWeek) {
                    const d = prevData[lastWeek];
                    const val = Number((d?.total_kWh ?? 0).toFixed(2));
                    prevMonthHistory.push({
                        label: `W${lastWeek}-${prevMonth}`,
                        value: val,
                        dataPointText: val,
                        date: `${(d.start_date || "").replace(`${year}-`, "")} - ${(d.end_date || "").replace(`${year}-`, "")}`,
                        month: prevMonth,
                    });
                }
            }
        }

        // 🔹 Combine and sort
        history = [...prevMonthHistory, ...thisMonthHistory].sort((a, b) => {
            const [wa, ma] = a.label.replace("W", "").split("-");
            const [wb, mb] = b.label.replace("W", "").split("-");
            return ma === mb ? Number(wa) - Number(wb) : Number(ma) - Number(mb);
        });

        // 🔹 AI prediction
        const predictions = await predictionServices.predict_usage(userId, deviceId, appliance.name);
        const barData2 = Array.isArray(predictions?.weekly)
            ? predictions.weekly.map((p) => ({
                label: p.label,
                value: p.value,
                dataPointText: p.value,
            }))
            : [];

        results.push({
            applianceName: appliance.name,
            latestKwh: history.at(-1)?.value ?? 0,
            barData: history,
            barData2,
        });
    }

    return results;
};
/** 🔹 Monthly report per appliance */
export const fetchMonthlyReport = async (userId, deviceId, appliances) => {
    const year = new Date().getFullYear().toString();
    const results = [];

    for (const appliance of appliances) {
        const ref1 = ref(db, `monthly_summary/${userId}/${deviceId}/${appliance.name}/${year}`);
        const snap = await get(ref1);
        const data = snap.exists() ? snap.val() : {};
        const months = Object.keys(data).sort();

        const history = months.map(m => {
            const val = Number((data[m]?.total_kWh ?? 0).toFixed(2));
            return {
                label: getMonthName(m, "short"),
                value: val,
                dataPointText: val
            };
        });

        // 🔸 Fetch AI prediction
        const predictions = await predictionServices.predict_usage(userId, deviceId, appliance.name);
        const barData2 = Array.isArray(predictions?.monthly)
            ? predictions.monthly.map(p => ({
                label: p.label,
                value: p.value,
                dataPointText: p.value
            }))
            : [];

        results.push({
            applianceName: appliance.name,
            latestKwh: history.at(-1)?.value ?? 0,
            barData: history,
            barData2
        });
    }

    return results;
};

export const fetchDailyTotalConsumption = async (userId) => {
    try {
        const dates = getLastNDays(7);
        const usageData = [];

        const history = [];

        for (const date of dates) {
            const dailyRef = ref(db, `daily_total_consumption/${userId}/${date}`);
            const snapshot = await get(dailyRef);

            let total = 0;
            if (snapshot.exists()) {
                const data = snapshot.val();
                total = Number((data?.total_energy_consumption ?? 0).toFixed(2));
            }
            history.push({
                label: date.slice(5),
                value: total,
                dataPointText: total,
                date,
            });
        }
        const predictions = await predictionServices.predict_totals(userId, "daily");
        const barData2 = Array.isArray(predictions?.daily)
            ? predictions.daily.map((p) => ({
                label: p.label,
                value: p.value,
                dataPointText: p.value,
            }))
            : [];
        usageData.push({
            title: "Daily Total Consumption",
            latestKwh: history.length > 0 ? history[history.length - 1].value : 0,
            barData: history,
            barData2
        });

        return usageData;
    } catch (error) {
        console.error("❌ Error in fetchDailyTotalConsumption:", error);
        return [];
    }
};


/** 🔹 Weekly total consumption */
export const fetchWeeklyTotalConsumption = async (userId) => {
    try {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const prevMonth = String(date.getMonth()).padStart(2, "0");

        let history = [];

        // 🔹 Fetch current month weeks
        const ref1 = ref(db, `weekly_total_consumption/${userId}/${year}/${month}`);
        const snap1 = await get(ref1);
        const data1 = snap1.exists() ? snap1.val() : {};
        const thisMonthWeeks = Object.keys(data1).sort();

        const thisMonthHistory = thisMonthWeeks.map((w) => {
            const d = data1[w];
            const val = Number((d?.total_energy_consumption ?? 0).toFixed(2));
            return {
                label: `W${w}-${month}`,
                value: val,
                dataPointText: val,
                date: `${(d.start_date || "").replace(`${year}-`, "")} - ${(d.end_date || "").replace(`${year}-`, "")}`,
                month,
            };
        });

        // 🔹 Include last week of previous month if < 2 weeks this month
        let prevMonthHistory = [];

        if (thisMonthWeeks.length < 1 && prevMonth !== "00") {
            const ref2 = ref(db, `weekly_total_consumption/${userId}/${year}/${prevMonth}`);
            const snap2 = await get(ref2);
            if (snap2.exists()) {
                const prevData = snap2.val();
                const lastWeek = Object.keys(prevData).sort().at(-1);
                if (lastWeek) {
                    const d = prevData[lastWeek];
                    const val = Number((d?.total_energy_consumption ?? 0).toFixed(2));
                    prevMonthHistory.push({
                        label: `W${lastWeek}-${prevMonth}`,
                        value: val,
                        dataPointText: val,
                        date: `${(d.start_date || "").replace(`${year}-`, "")} - ${(d.end_date || "").replace(`${year}-`, "")}`,
                        month: prevMonth,
                    });
                }
            }
        }

        // 🔹 Combine & sort
        history = [...prevMonthHistory, ...thisMonthHistory].sort((a, b) => {
            const [wa, ma] = a.label.replace("W", "").split("-");
            const [wb, mb] = b.label.replace("W", "").split("-");
            return ma === mb ? Number(wa) - Number(wb) : Number(ma) - Number(mb);
        });

        // 🔹 AI prediction
        const predictions = await predictionServices.predict_totals(userId, "weekly");
        const barData2 = Array.isArray(predictions?.weekly)
            ? predictions.weekly.map((p) => ({
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
    } catch (error) {
        console.error("❌ Error in fetchWeeklyTotalConsumption:", error);
        return [];
    }
};



/** 🔹 Monthly total consumption */
export const fetchMonthlyTotalConsumption = async (userId) => {
    const refPath = ref(db, `monthly_total_consumption/${userId}`);
    const snap = await get(refPath);
    if (!snap.exists()) return [];

    const years = Object.keys(snap.val());
    const history = [];
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (const year of years) {
        const yearData = snap.val()[year];
        const months = Object.keys(yearData).sort();
        for (const month of months) {
            const m = yearData[month];
            const total = Number((m.total_energy_consumption ?? 0).toFixed(2));

            history.push({
                label: getMonthName(month, 'short'),
                value: total,
                dataPointText: total,
                date: `${m.start_date ?? ""} - ${m.end_date ?? ""}`,
            });
        }
    }

    // 🔸 Keep last 5 months (latest 5 months in chronological order)
    const recent = history.slice(-5);

    // 🔸 Fetch AI prediction
    const predictions = await predictionServices.predict_totals(userId, "monthly");
    const barData2 = Array.isArray(predictions?.monthly)
        ? predictions.monthly.map((p) => ({
            label: p.label,
            value: p.value,
            dataPointText: p.value,
            monthIndex: monthOrder.indexOf(p.label), // Store the month index for AI data
        }))
        : [];

    // Sort AI predictions to match the chronological month order
    barData2.sort((a, b) => a.monthIndex - b.monthIndex);

    return [
        {
            title: "Monthly Total Consumption",
            barData: recent,
            barData2,
        },
    ];
};


export const fetchDailyKwh = async (userId) => {
    const todayStr = format(new Date(), "yyyy-MM-dd", { timeZone: "Asia/Manila" });
    const dailyRef = ref(db, `daily_total_consumption/${userId}/${todayStr}`);
    const snapshot = await get(dailyRef);

    if (snapshot.exists()) {
        return snapshot.val().total_energy_consumption ?? 0;
    } else {
        return 0;
    }
};

export const fetchAllMonthlyTotalConsumption = async (userId) => {
    const monthlyTotalConsumptionRef = ref(db, `monthly_total_consumption/${userId}`);
    const monthlyTotalConsumptionSnapshot = await get(monthlyTotalConsumptionRef);
    const monthlyTotalConsumption = monthlyTotalConsumptionSnapshot.val() || {};

    const monthlyTotals = [];
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const year in monthlyTotalConsumption) {
        for (const month in monthlyTotalConsumption[year]) {
            monthlyTotals.push({
                label: getMonthName(month, 'short'),
                value: monthlyTotalConsumption[year][month].total_energy_consumption || 0,
                dataPointText: monthlyTotalConsumption[year][month].total_energy_consumption || 0
            });
        }
    }
    monthlyTotals.sort((a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label));
    return monthlyTotals;
}
