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
                extraData: {
                    avg_power: Number(data?.avg_power.toFixed(2) ?? 0),
                    total_kWh: Number(data?.total_kWh.toFixed(2) ?? 0),
                    max_power: Number(data?.max_power.toFixed(2) ?? 0),
                    date: date
                }
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
    const dates = getLastNWeeks(4);
    const usageData = []
}

export const fetchMonthlyRerport = async (userId, deviceId, appliances) => {

}

export const fetchDailyKwh = async (userId) => {
    const dailySummaryRef = ref(db, `daily_summary/${userId}`);
    const dailySummarySnapshot = await get(dailySummaryRef);
    return dailySummarySnapshot.val()
}