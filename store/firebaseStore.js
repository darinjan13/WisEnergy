import { get, ref, update } from 'firebase/database';
import { create } from 'zustand';
import { auth, db } from '../firebase/firebaseConfig';
import Toast from 'react-native-toast-message';


const devicesRef = ref(db, "devices");

const fetchDevices = async () => {
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

const setUserDevices = (devices) => {
    const userDevices = [];
    devices.map((deviceData) => {
        if (deviceData.owner == auth.currentUser.uid) {
            userDevices.push({
                ...deviceData
            })
        }
    })

    return userDevices;
}

const setUnpairedDevices = (devices) => {
    const unpairedDevices = [];
    devices.map((deviceData) => {
        if (deviceData.status === "unpaired") {
            unpairedDevices.push({
                label: deviceData.id,
                value: deviceData.id
            })
        }
    })
    return unpairedDevices;
}

const addDevice = async (devices, deviceCode, selectedUnpairedDevice, device_nickname, set) => {
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

            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Device successfully paired!",
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to update device." + error,
            });
        }

    } else {
        setTimeout(() => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "No matching device found or device is already paired.",
            });
        }, 500);
    }
};

export const useDeviceStore = create((set, get) => ({
    devices: [],
    userDevices: [],
    unpairedDevices: [],
    setDevices: async () => {
        const data = await fetchDevices();
        const userDevices = setUserDevices(data);
        const unpairedDevices = setUnpairedDevices(data);
        set({
            devices: data,
            userDevices,
            unpairedDevices,
        });
    },

    addDevice: async (deviceCode, selectedUnpairedDevice, device_nickname) => {
        const devices = get().devices;
        await addDevice(devices, deviceCode, selectedUnpairedDevice, device_nickname, set);
    },
}));