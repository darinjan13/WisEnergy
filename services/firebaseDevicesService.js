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
    // Delete the subtrees directly. The old version discovered appliance names
    // from appliances/ and daily_summary/ and deleted per-date children, so any
    // name that existed only under usage/ was silently skipped and survived a
    // "full" reset. A single remove() per subtree cannot miss anything.
    await rm(`usage/${uid}/${deviceId}`);
    await rm(`daily_summary/${uid}/${deviceId}`);
    await rm(`weekly_summary/${uid}/${deviceId}`);
    await rm(`monthly_summary/${uid}/${deviceId}`);
    // Preserve the appliance registry (nickname/added_at/is_active) —
    // zero only the energy counters.
    try {
        const snap = await get(ref(db, `appliances/${uid}/${deviceId}`));
        const apps = snap.exists() ? snap.val() : {};
        for (const name of Object.keys(apps)) {
            try {
                await update(ref(db, `appliances/${uid}/${deviceId}/${name}`), { latest_kwh: 0 });
            } catch (e) {
                failed.push(`appliances/${uid}/${deviceId}/${name}/latest_kwh (${e?.code || e?.message || "denied"})`);
            }
        }
    } catch (e) {
        failed.push(`appliances/${uid}/${deviceId} (list: ${e?.code || e?.message})`);
    }
    return { failed };
};

/* List the dates that actually hold raw readings for one device.
   Appliance names are read from `usage/` itself — the authoritative source —
   so a renamed or unregistered appliance can never be missed.
   Returns { dates: ["YYYY-MM-DD", ...] sorted asc, names: [...] }. */
export const listUsageDates = async (uid, deviceId) => {
    try {
        const dbRoot = ref(db).toString().replace(/\/$/, "");
        const token = await auth.currentUser.getIdToken();
        const names = await shallowKeys(dbRoot, token, `usage/${uid}/${deviceId}`);
        const dates = new Set();
        for (const name of names) {
            const days = await shallowKeys(dbRoot, token, `usage/${uid}/${deviceId}/${name}`);
            for (const d of days) dates.add(d);
        }
        return { dates: [...dates].sort(), names };
    } catch (e) {
        return { dates: [], names: [], error: e?.code || e?.message || "failed" };
    }
};

/* Delete selected days only: raw readings + that day's daily summary, plus the
   week/month summary buckets those days fall into (otherwise they keep
   reporting the deleted readings; the backend regenerates them).
   Appliance names come from usage/, so nothing is missed.
   Registry, latest_kwh and user-level totals are left untouched. */
export const clearDeviceData = async (uid, deviceId, { dates = [] } = {}) => {
    const failed = [];
    const picked = [...new Set(dates)].filter(Boolean);
    if (picked.length === 0) return { failed, deleted: 0, names: [] };

    const rm = async (path) => {
        try {
            await remove(ref(db, path));
        } catch (e) {
            failed.push(`${path} (${e?.code || e?.message || "denied"})`);
        }
    };

    let names = [];
    try {
        const dbRoot = ref(db).toString().replace(/\/$/, "");
        const token = await auth.currentUser.getIdToken();
        // Union both sources: usage-only names must not be missed (the old bug),
        // and summary-only names still need their daily node removed.
        const usageNames = await shallowKeys(dbRoot, token, `usage/${uid}/${deviceId}`);
        const summaryNames = await shallowKeys(dbRoot, token, `daily_summary/${uid}/${deviceId}`);
        names = [...new Set([...usageNames, ...summaryNames])];
    } catch (e) {
        return { failed: [`(auth/db url: ${e?.code || e?.message})`], deleted: 0, names: [] };
    }

    const months = new Set(picked.map((d) => `${d.slice(0, 4)}/${d.slice(5, 7)}`));
    let deleted = 0;

    for (const name of names) {
        for (const date of picked) {
            await rm(`usage/${uid}/${deviceId}/${name}/${date}`);
            await rm(`daily_summary/${uid}/${deviceId}/${name}/${date}`);
            deleted += 1;
        }
        for (const ym of months) {
            const [year, month] = ym.split("/");
            await rm(`weekly_summary/${uid}/${deviceId}/${name}/${year}/${month}`);
            await rm(`monthly_summary/${uid}/${deviceId}/${name}/${year}/${month}`);
        }
    }

    return { failed, deleted, names };
};

/* Clear ONLY the raw readings node for a device. Summaries, kWh counters and
   the appliance registry are deliberately left alone. */
export const clearUsageNode = async (uid, deviceId) => {
    const failed = [];
    try {
        await remove(ref(db, `usage/${uid}/${deviceId}`));
    } catch (e) {
        failed.push(`usage/${uid}/${deviceId} (${e?.code || e?.message || "denied"})`);
    }
    return { failed };
};

/* Delete every owned device's readings + summaries + kWh (chunked),
   but keep the devices themselves, totals and predictions.
   Returns { failed: [...] }. */
export const resetAllDevicesData = async (uid) => {
    const failed = [];
    let dbRoot = "";
    let token = "";
    try {
        dbRoot = ref(db).toString().replace(/\/$/, "");
        token = await auth.currentUser.getIdToken();
    } catch (e) {
        return { failed: [`(auth/db url: ${e?.code || e?.message})`] };
    }
    const deviceIds = await shallowKeys(dbRoot, token, "devices");
    for (const deviceId of deviceIds) {
        let owner = "";
        try {
            const snap = await get(ref(db, `devices/${deviceId}/owner`));
            owner = snap.exists() ? snap.val() : "";
        } catch (e) {
            failed.push(`devices/${deviceId}/owner (read: ${e?.code || e?.message})`);
            continue;
        }
        if (owner !== uid) continue;
        const r = await resetDeviceHistory(uid, deviceId);
        failed.push(...r.failed);
    }
    return { failed };
};

/* Delete a whole account's energy history: every owned device (chunked,
   reuses resetAllDevicesData) plus user-level totals and predictions.
   Devices registry, profile, budgets, tokens and notifications are kept. */
export const resetAccountData = async (uid) => {
    const failed = [];
    const perDevice = await resetAllDevicesData(uid);
    failed.push(...perDevice.failed);
    for (const p of [
        `daily_total_consumption/${uid}`,
        `weekly_total_consumption/${uid}`,
        `monthly_total_consumption/${uid}`,
        `predictions/${uid}`,
    ]) {
        try {
            await remove(ref(db, p));
        } catch (e) {
            failed.push(`${p} (${e?.code || e?.message || "denied"})`);
        }
    }
    return { failed };
};

/* Factory reset: account wipe PLUS unpair every owned device (removes their
   registry entries; firmware re-registers them as unpaired on next boot).
   Keeps tokens, profile, budgets, reviews, feedback, notifications. */
export const factoryResetEnergy = async (uid) => {
    const failed = [];
    const perDevice = await resetAllDevicesData(uid);
    failed.push(...perDevice.failed);
    let dbRoot = "";
    let token = "";
    try {
        dbRoot = ref(db).toString().replace(/\/$/, "");
        token = await auth.currentUser.getIdToken();
    } catch (e) {
        failed.push(`(auth/db url: ${e?.code || e?.message})`);
    }
    if (dbRoot && token) {
        const deviceIds = await shallowKeys(dbRoot, token, "devices");
        for (const deviceId of deviceIds) {
            let owner = "";
            try {
                const snap = await get(ref(db, `devices/${deviceId}/owner`));
                owner = snap.exists() ? snap.val() : "";
            } catch (e) {
                failed.push(`devices/${deviceId}/owner (read: ${e?.code || e?.message})`);
                continue;
            }
            if (owner !== uid) continue;
            try {
                await remove(ref(db, `devices/${deviceId}`));
            } catch (e) {
                failed.push(`devices/${deviceId} (${e?.code || e?.message || "denied"})`);
            }
            try {
                await remove(ref(db, `appliances/${uid}/${deviceId}`));
            } catch (e) {
                failed.push(`appliances/${uid}/${deviceId} (${e?.code || e?.message || "denied"})`);
            }
        }
    }
    for (const p of [
        `daily_total_consumption/${uid}`,
        `weekly_total_consumption/${uid}`,
        `monthly_total_consumption/${uid}`,
        `predictions/${uid}`,
    ]) {
        try {
            await remove(ref(db, p));
        } catch (e) {
            failed.push(`${p} (${e?.code || e?.message || "denied"})`);
        }
    }
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