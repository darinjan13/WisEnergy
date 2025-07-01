import { get, limitToLast, off, onValue, orderByKey, query, ref } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';

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