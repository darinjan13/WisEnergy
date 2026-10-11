import { get, off, onValue, ref, remove, update } from 'firebase/database';
import { auth, db } from '../firebase/firebaseConfig';

/* Delete one device's full history (readings + summaries + kWh).
   Deletes per-date so big histories never trip WRITE_TOO_BIG.
   Dates are discovered with a shallow REST list (keys only, no downloads),
   so unsummarized stray dates are caught too.
   Returns { failed: ["path (reason)", ...] }.
   User-level totals are intentionally left alone (shared across devices). */
const shallowKeys = async (dbRootUrl, token, path) => {
    try {
        const r = await fetch(`${dbRootUrl}${path}.json?shallow=true&auth=${token}`);
        if (!r.ok) return [];
        const j = await r.json();
        return j ? Object.keys(j) : [];
    } catch (e) {
        return [];
    }
};

export const resetDeviceHistory = async (uid, deviceId) => {
    const failed = [];
    const rm = async (path) => {
        try {
            await remove(ref(db, path));
        } catch (e) {
            failed.push(`${path} (${e?.code || e?.message || "denied"})`);
        }
    };
    const today = new Date().toISOString().slice(0, 10);
    let dbRoot = "";
    let token = "";
    try {
        dbRoot = ref(db).toString().replace(/\/$/, "");
        token = await auth.currentUser.getIdToken();
    } catch (e) {
        failed.push(`(auth/db url: ${e?.code || e?.message})`);
        return { failed };
    }
    const applianceNames = await shallowKeys(dbRoot, token, `appliances/${uid}/${deviceId}`);
    const names = applianceNames.length > 0 ? applianceNames : ["Whole Room"];
    for (const name of names) {
        const usageDays = await shallowKeys(dbRoot, token, `usage/${uid}/${deviceId}/${name}`);
        const summaryDays = await shallowKeys(dbRoot, token, `daily_summary/${uid}/${deviceId}/${name}`);
        const dates = new Set([...usageDays, ...summaryDays, today]);
        for (const date of dates) {
            await rm(`usage/${uid}/${deviceId}/${name}/${date}`);
            await rm(`daily_summary/${uid}/${deviceId}/${name}/${date}`);
        }
    }
    for (const p of [
        `weekly_summary/${uid}/${deviceId}`,
        `monthly_summary/${uid}/${deviceId}`,
        `appliances/${uid}/${deviceId}`,
    ]) await rm(p);
    return { failed };
};

export const fetchDevices = async () => {

    const devicesRef = ref(db, "devices");
    const snapshot = await get(devicesRef);
    const devices = []
    snapshot.forEach((child) => {
        const deviceData = child.val()
        devices.push({
            ...deviceData,
            id: child.key
        })
    })
    return devices;
}

export const setUserDevices = (devices) => {
    return devices.filter(deviceData => deviceData.owner === auth.currentUser.uid);
}

export const setUnpairedDevices = (devices) => {
    return devices
        .filter(deviceData => deviceData.status === "unpaired")
        .map(deviceData => ({
            label: deviceData.id,
            value: deviceData.id
        }));
}

export const listenToUserAppliances = (userId, callback) => {
    const appliancesRef = ref(db, `appliances/${userId}`);

    const handler = (snapshot) => {

        if (!snapshot.exists()) {
            callback([]);
            return;
        }

        const userAppliances = [];

        snapshot.forEach((deviceSnap) => {
            const deviceId = deviceSnap.key;

            const appliances = [];
            deviceSnap.forEach((applianceSnap) => {
                const data = applianceSnap.val();

                appliances.push({
                    name: applianceSnap.key,
                    nickname: data.appliance_nickname || null,
                    added_at: data.added_at,
                });
            });

            userAppliances.push({ id: deviceId, appliances });
        });

        callback(userAppliances);
    };

    onValue(appliancesRef, handler);

    // Proper unsubscribe
    return () => off(appliancesRef, "value", handler);
};


// export const listenToUserAppliances = (callback) => {
//     const appliancesRef = ref(db, `appliances/${auth.currentUser?.uid}`);

//     const unsubscribe = onValue(appliancesRef, (snapshot) => {
//         const userAppliances = [];

//         snapshot.forEach((deviceSnap) => {
//             const deviceId = deviceSnap.key;
//             const appliances = [];
//             deviceSnap.forEach((applianceSnap) => {
//                 appliances.push({
//                     name: applianceSnap.key,
//                     added_at: applianceSnap.val().added_at,
//                 });
//             });
//             userAppliances.push({ id: deviceId, appliances });
//         });

//         callback(userAppliances);
//     });

//     // return unsubscribe function
//     return () => off(appliancesRef, "value", unsubscribe);
// };

export const fetchUserAppliances = async () => {
    const appliancesRef = ref(db, `appliances/${auth.currentUser?.uid}`);
    const snapshot = await get(appliancesRef);

    const userAppliances = [];

    snapshot.forEach((deviceSnap) => {
        const deviceId = deviceSnap.key;
        const appliances = [];
        deviceSnap.forEach((applianceSnap) => {
            appliances.push({
                name: applianceSnap.key,
                added_at: applianceSnap.val().added_at
            });
        });
        userAppliances.push({
            id: deviceId,
            appliances
        });
    });
    return userAppliances;
}

export const setDeviceApplianceName = async (devices, deviceId, applianceName) => {
    const deviceRef = ref(db, `devices/${deviceId}`);

    await update(deviceRef, { appliance_name: applianceName });
    const updatedDevices = devices.map(device =>
        device.id === deviceId
            ? { ...device, appliance_name: applianceName }
            : device
    );
    return updatedDevices;
}

export const setApplianceActive = async (userId, deviceId, applianceName, active) => {
    const appliancesRef = ref(db, `appliances/${userId}/${deviceId}/${applianceName.replace(/ /g, "_")}`);
    const applianceSnapshot = await get(appliancesRef)
    if (applianceSnapshot.exists()) {
        if (applianceSnapshot.val().added_at !== undefined) {
            await update(appliancesRef, { is_active: active });
        }

    }
}

export const setOnlyOneActive = async (userId, deviceId, newActiveAppliance) => {
    const appliancesRef = ref(db, `appliances/${userId}/${deviceId}`);
    const snapshot = await get(appliancesRef);

    const updates = {};
    snapshot.forEach(applianceSnap => {
        const name = applianceSnap.key;
        updates[`${name}/is_active`] = (name === newActiveAppliance);
    });
    await update(appliancesRef, updates);
};

export const addDevice = async (devices, deviceCode, selectedUnpairedDevice, device_nickname, set) => {
    let matchedDeviceKey = null;

    devices.forEach((device) => {
        if (
            device.id === selectedUnpairedDevice.trim() &&
            device.pairing_code === deviceCode.trim() &&
            device.status === "unpaired"
        ) {
            matchedDeviceKey = device.id;
        }
    });

    if (matchedDeviceKey) {
        const today = new Date().toLocaleDateString();

        try {
            await update(ref(db, `devices/${matchedDeviceKey}`), {
                device_nickname: device_nickname,
                owner: auth.currentUser.uid,
                status: "paired",
                paired_at: today,
            });

            const updatedDevices = await fetchDevices();
            set({
                devices: updatedDevices,
                userDevices: setUserDevices(updatedDevices),
                unpairedDevices: setUnpairedDevices(updatedDevices),
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: "Failed to update device." + error };
        }
    } else {
        return { success: false, error: "No matching device found or device is already paired." };
    }
};

export const updateDeviceNickname = async (deviceId, device_nickname) => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    await update(deviceRef, { device_nickname });
};

export const deleteDevice = async (deviceId) => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    await update(deviceRef, {
        status: 'unpaired',
        owner: '',
        device_nickname: '',
        paired_at: null,
    });
};

export const toggleRelay = async (deviceId, value) => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    await update(deviceRef, { relay_desired: value });
};