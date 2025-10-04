import { get, limitToLast, off, onValue, orderByKey, query, ref } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { getLastNDays, getLastNWeeks, getLastNMonths, getMonthName } from '../utils/dateHelper'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as predictionServices from './apiService'
import { format } from "date-fns-tz";
import { getDailyReportCache, getMonthlyReportCache, getWeeklyReportCache, saveDailyReportCache, saveMonthlyReportCache, saveWeeklyReportCache } from '../utils/asyncStorageUtils';

export const listenToLatestPower = (userId, deviceId, applianceName, date, callback, latestKwh) => {
    const powerRef = ref(db, `usage/${userId}/${deviceId}/${applianceName}/${date}`);
    const latestPowerQuery = query(powerRef, orderByKey(), limitToLast(1));
    const unsubscribe = onValue(latestPowerQuery, (snapshot) => {
        let latestPower = null;
        snapshot.forEach(childSnap => {
            latestPower = childSnap.val().power;
        });
        callback(latestPower);
    });
    return () => off(powerRef, 'value', unsubscribe);
};

// export const listenToLatestKwh = (userId, deviceId, applianceName, callback) => {
//     const kwhRef = ref(db, `appliances/${userId}/${deviceId}/${applianceName}/latest_kwh`);

//     const unsubscribe = onValue(kwhRef, (snapshot) => {
//         console.log(snapshot.val());

//         callback(snapshot.val());
//     });
//     return () => off(kwhRef, 'value', unsubscribe);
// };

export const fetchTodayTrend = async (userId) => {
    try {
        const today = format(new Date(), "yyyy-MM-dd", { timeZone: "Asia/Manila" });
        const summaryRef = ref(db, `daily_summary/${userId}`);
        const snapshot = await get(summaryRef);

        if (!snapshot.exists()) {
            console.log("⚠️ No daily summary found.");
            return null;
        }

        // 6 groups of 4 hours
        const buckets = {
            "12am-4am": 0,
            "4am-8am": 0,
            "8am-12pm": 0,
            "12pm-4pm": 0,
            "4pm-8pm": 0,
            "8pm-12am": 0,
        };

        // detailed hourly map for drilldown
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

        return { buckets, hourlyData };
    } catch (error) {
        console.error("❌ Error fetching today trend:", error);
        return null;
    }
};

export const fetchTopAppliances = async (userId, limit = 5) => {
    const key = `@overall_top_appliances:${userId}`;

    try {
        // 1. Check cache
        const cachedStr = await AsyncStorage.getItem(key);
        if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            return cached.data;
        }

        // 2. Fetch all daily_summary for this user
        const summaryRef = ref(db, `daily_summary/${userId}`);
        const snapshot = await get(summaryRef);

        if (!snapshot.exists()) {
            console.log("⚠️ No daily summary found for top appliances.");
            return [];
        }

        const totals = {}; // { applianceName: total_kWh }

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

        // 3. Convert + sort
        const appliances = Object.entries(totals).map(([name, kwh]) => ({
            name,
            kwh: Number(kwh.toFixed(2)),
        }));

        const top = appliances.sort((a, b) => b.kwh - a.kwh).slice(0, limit);

        // 4. Cache result (no expiry unless you clear it)
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

    // Flatten only latest_kwh for each appliance
    Object.entries(data).forEach(([applianceName, applianceData]) => {
        results[applianceName] = applianceData?.latest_kwh ?? 0;
    });

    return results;
};

export const fetchMonthlyTotalConsumption = (userId, callback) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const monthlyTotalConsumptionRef = ref(db, `monthly_total_consumption/${userId}/${year}/${month}/total_energy_consumption`);
    const listener = onValue(monthlyTotalConsumptionRef, (snapshot) => {
        callback(snapshot.val());
    })

    return () => off(monthlyTotalConsumptionRef, 'value');
}

export const getCachedDailyReport = async (userId, deviceId, appliances) => {
    const isCached = await getDailyReportCache(userId, deviceId);
    if (isCached) return isCached;

    const fresh = await fetchDailyReport(userId, deviceId, appliances);

    const updatedData = await Promise.all(
        fresh.map(async (item) => {
            const predictions = await predictionServices.predict_usage(
                userId,
                deviceId,
                item.applianceName
            );

            if (!predictions?.daily?.length) {
                return item;
            }

            const barData2 = predictions.daily.map((p) => ({
                label: p.label, // "08-26"
                value: p.value, // numeric kWh
                dataPointText: p.value,
            }));

            return { ...item, barData2 };
        })
    );
    await saveDailyReportCache(userId, deviceId, updatedData);
    return updatedData;
}

export const fetchDailyReport = async (userId, deviceId, appliances) => {
    const dates = getLastNDays(5);
    const today = dates[dates.length - 1]; // last entry from getLastNDays = today
    const usageData = [];

    for (const appliance of appliances) {
        const history = [];

        for (const date of dates) {
            const dailySummaryRef = ref(
                db,
                `daily_summary/${userId}/${deviceId}/${appliance.name}/${date}`
            );

            const snapshot = await get(dailySummaryRef);

            let data;
            if (snapshot.exists()) {
                data = snapshot.val();
            }

            const value = Number(data?.total_kWh?.toFixed(2) ?? 0);

            history.push({
                label: date.slice(5), // MM-DD
                value,
                dataPointText: value,
            });
        }

        usageData.push({
            applianceName: appliance.name,
            latestKwh: history.length > 0 ? history[history.length - 1].value : 0,
            barData: history,
        });
    }

    return usageData;
};

export const getCachedWeeklyReport = async (userId, deviceId, appliances) => {
    const isCached = await getWeeklyReportCache(userId, deviceId);
    if (isCached) return isCached;

    const fresh = await fetchWeeklyReport(userId, deviceId, appliances);

    const updatedData = await Promise.all(
        fresh.map(async (item) => {
            const predictions = await predictionServices.predict_usage(
                userId,
                deviceId,
                item.applianceName
            );

            if (!predictions?.weekly?.length) {
                return item;
            }

            const barData2 = predictions.weekly.map((p) => ({
                label: p.label, // "W04"
                value: p.value,
                dataPointText: p.value,
            }));

            return { ...item, barData2 };
        })
    );

    await saveWeeklyReportCache(userId, deviceId, updatedData);
    return updatedData;
};

export const fetchWeeklyReport = async (userId, deviceId, appliances) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const prevMonth = String(date.getMonth()).padStart(2, "0"); // previous month
    const usageData = [];

    for (const appliance of appliances) {
        let history = [];
        let data = {};
        let weeks = [];

        // Try current month
        const ref1 = ref(db, `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${month}`);
        const snapshot1 = await get(ref1);

        if (snapshot1.exists()) {
            data = snapshot1.val();
            weeks = Object.keys(data).sort();
        }

        // Fallback: try previous month if no current data
        if (weeks.length === 0 && prevMonth !== "0") {
            const ref2 = ref(db, `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${prevMonth}`);
            const snapshot2 = await get(ref2);
            if (snapshot2.exists()) {
                data = snapshot2.val();
                weeks = Object.keys(data).sort();
            }
        }

        // Format chart data
        history = weeks.map((week) => {
            const d = data[week] || {};
            const start = (d.start_date || "").replace("2025-", "");
            const end = (d.end_date || "").replace("2025-", "");
            const total = Number((d.total_kWh ?? 0).toFixed(2));

            return {
                label: week.replace(/^0/, "W"), // W1, W2, etc.
                value: total,
                dataPointText: total,
                date: `${start} - ${end}`,
                month: start.split("-")[0] || "",
            };
        });

        usageData.push({
            applianceName: appliance.name,
            barData: history,
            latestKwh: history.length > 0 ? history[history.length - 1].value : 0
        });
    }

    return usageData;
};

export const getCachedMonthlyReport = async (userId, deviceId, appliances) => {
    const isCached = await getMonthlyReportCache(userId, deviceId);
    if (isCached) return isCached;

    const fresh = await fetchMonthlyReport(userId, deviceId, appliances);

    const updatedData = await Promise.all(
        fresh.map(async (item) => {
            const predictions = await predictionServices.predict_usage(
                userId,
                deviceId,
                item.applianceName
            );

            if (!predictions?.monthly?.length) { // <-- you can later add .monthly if backend supports it
                return item;
            }

            const barData2 = predictions.weekly.map((p) => ({
                label: p.label,
                value: p.value,
                dataPointText: p.value,
            }));

            return { ...item, barData2 };
        })
    );

    await saveMonthlyReportCache(userId, deviceId, updatedData);
    return updatedData;
};



export const fetchMonthlyReport = async (userId, deviceId, appliances) => {
    const date = new Date();
    const year = date.getFullYear().toString();
    const usageData = [];

    for (const appliance of appliances) {
        let data = {};
        let months = [];

        // Look up this year
        const ref1 = ref(db, `monthly_summary/${userId}/${deviceId}/${appliance.name}/${year}`);
        const snapshot1 = await get(ref1);

        if (snapshot1.exists()) {
            data = snapshot1.val();          // object keyed by month ("08", "09", "10", …)
            months = Object.keys(data).sort();
        }

        let history = [];

        history = months.map((month) => {
            const d = data[month] || {};

            const start = (d.start_date || "").replace(`${year}-`, "");
            const end = (d.end_date || "").replace(`${year}-`, "");
            const total = Number((d.total_kWh ?? 0).toFixed(2));
            console.log(total);

            return {
                label: month, // "08", "09", etc.
                value: total,
                dataPointText: total,
                date: `${start} - ${end}`,
            };
        });

        usageData.push({
            applianceName: appliance.name,
            barData: history,
            latestKwh: history.length > 0 ? history[history.length - 1].value : 0
        });
    }

    return usageData;
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
