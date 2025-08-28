import { get, limitToLast, off, onValue, orderByKey, query, ref } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { getlastNDays, getLastNWeeks, getLastNMonths } from '../utils/dateHelper'

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

export const fetchWeeklyReport = async (userId, deviceId, appliances) => {
    const date = new Date();
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const usageData = []


    for (const appliance of appliances) {

        const history = []
        const weeklySummaryRef = ref(db, `weekly_summary/${userId}/${deviceId}/${appliance.name}/${year}/${month}`)
        const snapshot = await get(weeklySummaryRef);

        let data;
        let weeks

        if (snapshot.exists()) {
            data = snapshot.val()
            weeks = Object.keys(data).sort();
        }

        for (const week of weeks) {
            const d = data[week] || {}
            const start = d.start_date.replace("2025-", "") || "";
            const end = d.end_date.replace("2025-", "") || "";
            const total = Number((d.total_kWh ?? 0).toFixed(2));

            history.push({
                label: week.replace("0", "W"),
                value: total,
                date: start + " - " + end
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