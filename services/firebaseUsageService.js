import { get, limitToLast, off, onValue, orderByKey, query, ref } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { getlastNDays, getLastNWeeks, getLastNMonths } from '../utils/dateHelper'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as predictionServices from './apiService'
import { format } from "date-fns-tz";
import { getDailyReportCache, saveDailyReportCache } from '../utils/asyncStorageUtils';

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

export const listenToLatestKwh = (userId, deviceId, applianceName, callback) => {
    const kwhRef = ref(db, `appliances/${userId}/${deviceId}/${applianceName}/latest_kwh`);
    const unsubscribe = onValue(kwhRef, (snapshot) => {
        callback(snapshot.val());
    });
    return () => off(kwhRef, 'value', unsubscribe);
};

export const fetchLatestKwhOnce = async (userId, deviceId, applianceName) => {
    const kwhRef = ref(db, `appliances/${userId}/${deviceId}/${applianceName}/latest_kwh`)
    const kwhSnapshot = await get(kwhRef);

    return { [applianceName]: kwhSnapshot.val() };
};

export const fetchMonthlyTotalConsumption = (userId, callback) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const monthlyTotalConsumptionRef = ref(db, `monthly_total_consumption/${userId}/${year}/${month}/total_energy_consumption`);
    // const monthlyTotalConsumptionSnapshot = await get(monthlyTotalConsumptionRef);
    const listener = onValue(monthlyTotalConsumptionRef, (snapshot) => {
        callback(snapshot.val());
    })

    return () => off(monthlyTotalConsumptionRef, 'value');
}

export const getCachedDailyReport = async (userId, deviceId, appliances) => {
    const isCached = await getDailyReportCache(userId, deviceId)
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: 'Asia/Manila' });

    if (isCached) {
        return isCached;
    }
    console.log("No Cached!");

    const fresh = await fetchDailyReport(userId, deviceId, appliances)

    const updatedData = await Promise.all(
        fresh.map(async (item) => {
            const predicted_kwh = await predictionServices.predidct_daily(
                userId,
                deviceId,
                item.applianceName
            );

            if (predicted_kwh === null || isNaN(predicted_kwh)) {
                return item
            }
            return {
                ...item,
                barData: [
                    ...item.barData,
                    {
                        label: todayStr.replace("2025-", ""),
                        value: Number(predicted_kwh.toFixed(2)),
                        frontColor: "#f59e0b"
                    }
                ]
            }
        })
    )
    await saveDailyReportCache(userId, deviceId, updatedData)
    return updatedData
}

export const fetchDailyReport = async (userId, deviceId, appliances) => {
    const dates = getlastNDays(5)
    const usageData = []
    for (const appliance of appliances) {
        const history = []

        for (const date of dates) {
            const dailySummaryRef = ref(db, `daily_summary/${userId}/${deviceId}/${appliance.name}/${date}`)
            const snapshot = await get(dailySummaryRef)

            let data;

            if (snapshot.exists()) {
                data = snapshot.val();
                console.log(data?.total_kWh.toFixed(2));

            }

            history.push({
                label: date.slice(5),
                value: Number(data?.total_kWh.toFixed(2) ?? 0),
            })
        }

        usageData.push({
            applianceName: appliance.name,
            barData: history
        })
    }

    return usageData;
}

export const getCacheWeeklyReport = async (userId, deviceId, appliances) => {
    const key = `@weekly_report:${userId}:${deviceId}`;
    const cacheStr = await AsyncStorage.getItem(key)

    const now = Date.now()
    const todayStr = format(now, "yyyy-MM-dd", { timeZone: "Asia/Manila" })

    if (cacheStr) {
        const cached = JSON.parse(cacheStr)
        if (cached.timestamp === todayStr) {
            return cached.data
        }
    }

    const fresh = await fetchWeeklyReport(userId, deviceId, appliances);

    await AsyncStorage.setItem(key, JSON.stringify({
        timestamp: todayStr,
        data: fresh
    }))

    return fresh;
}

export const fetchWeeklyReport = async (userId, deviceId, appliances) => {
    const date = new Date();
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const usageData = []
    const previousMonth = String(month - 1).padStart(2, '0')

    for (const appliance of appliances) {

        const history = []

        let foundData = false;
        let data;
        let weeks

        const ref1 = ref(db, `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${month}`)
        const snapshot1 = await get(ref1);

        if (snapshot1.exists()) {
            data = snapshot1.val()
            weeks = Object.keys(data).sort();
            if (weeks.length > 0) foundData = true;
        }

        if (!foundData) {
            const ref2 = ref(db, `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${previousMonth}`)

            const snapshot2 = await get(ref2);

            if (snapshot2.exists()) {
                data = snapshot2.val()
                weeks = Object.keys(data).sort();
            }
        }

        for (const week of weeks) {
            const d = data[week] || {}
            const start = d.start_date.replace("2025-", "") || "";
            const end = d.end_date.replace("2025-", "") || "";
            const total = Number((d.total_kWh ?? 0).toFixed(2));

            history.push({
                label: week.replace("0", "W"),
                value: total,
                date: start + " - " + end,
                month: start.split("-")[0]
            })
        }


        usageData.push({
            applianceName: appliance.name,
            barData: history
        })
    }

    return usageData;
}

export const fetchMonthlyRerport = async (userId, deviceId, appliances) => {
    const dates = getLastNMonths(5);
    const usageData = [];

    for (const appliance of appliances) {
        const history = []

        for (const date of dates) {
            const dailySummaryRef = ref(db, `monthly_summary/${userId}/${deviceId}/${appliance.name}/${date}`)

        }
    }
}

export const fetchDailyKwh = async (userId) => {
    const dailySummaryRef = ref(db, `daily_summary/${userId}`);
    const dailySummarySnapshot = await get(dailySummaryRef);
    return dailySummarySnapshot.val()
}