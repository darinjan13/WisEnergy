import { create } from 'zustand';
import * as firebaseDevicesServices from '../services/firebaseDevicesService'
import * as firebaseUsageServices from '../services/firebaseUsageService'

export const useDeviceStore = create((set, get) => ({
    devices: [],
    userDevices: [],
    unpairedDevices: [],
    userAppliances: [],
    setDevices: async () => {
        const data = await firebaseDevicesServices.fetchDevices();
        const userDevices = firebaseDevicesServices.setUserDevices(data);
        const unpairedDevices = firebaseDevicesServices.setUnpairedDevices(data);
        set({
            devices: data,
            userDevices,
            unpairedDevices,
        });
    },
    setDeviceApplianceName: async (deviceId, applianceName) => {
        const { devices } = get();
        const updatedDevices = await firebaseDevicesServices.setDeviceApplianceName(devices, deviceId, applianceName);
        set({ devices: updatedDevices });
    },
    fetchUserAppliances: async () => {
        const userAppliances = await firebaseDevicesServices.fetchUserAppliances();
        set({ userAppliances });
    },
    setApplianceActive: async (userId, deviceId, applianceName, active) => {
        await firebaseDevicesServices.setApplianceActive(userId, deviceId, applianceName, active);
    },
    setOnlyOneActive: async (userId, deviceId, applianceName) => {
        await firebaseDevicesServices.setOnlyOneActive(userId, deviceId, applianceName);
    },
    addDevice: async (deviceCode, selectedUnpairedDevice, device_nickname) => {
        const devices = get().devices;
        const addDeviceStatus = await firebaseDevicesServices.addDevice(devices, deviceCode, selectedUnpairedDevice, device_nickname, set);
        return addDeviceStatus;
    },
    updateDeviceNickname: async (deviceId, device_nickname) => {
        await firebaseDevicesServices.updateDeviceNickname(deviceId, device_nickname);
        set(state => {
            const updatedDevices = state.devices.map(device =>
                device.id === deviceId ? { ...device, device_nickname } : device
            );
            return {
                devices: updatedDevices,
                userDevices: firebaseDevicesServices.setUserDevices(updatedDevices),
                unpairedDevices: firebaseDevicesServices.setUnpairedDevices(updatedDevices),
            };
        });
    },
    deleteDevice: async (deviceId) => {
        await firebaseDevicesServices.deleteDevice(deviceId);
        set(state => {
            const updatedDevices = state.devices.map(device =>
                device.id === deviceId
                    ? { ...device, status: 'unpaired', owner: '', device_nickname: '', paired_at: null }
                    : device
            );
            return {
                devices: updatedDevices,
                userDevices: firebaseDevicesServices.setUserDevices(updatedDevices),
                unpairedDevices: firebaseDevicesServices.setUnpairedDevices(updatedDevices),
            };
        });
    },
}));

export const useUsageStore = create((set, get) => ({
    latestKwh: [],
    reportHistory: {
        daily: {},
        weekly: {},
        monthly: {}
    },
    summaryPerDevice: {},
    totalConsumptionByDate: {},
    lastFetched: {
        daily: null,
        weekly: null,
        monthly: null
    },

    fetchLatestKwhOnce: async (userId, deviceId, applianceName) => {
        const latestKwhObj = await firebaseUsageServices.fetchLatestKwhOnce(userId, deviceId, applianceName);
        const value = latestKwhObj[applianceName];
        set(state => ({
            latestKwh: { ...state.latestKwh, [applianceName]: value }
        }));
    },

    updateLatestKwh: async () => {
        const { latestKwh } = get();
        const updatedLatestKwh = await firebaseUsageServices.updateLatestKwh(latestKwh);
        set({ latestKwh: updatedLatestKwh });
    },

    fetchDailyReport: async (userId, deviceId, appliances) => {
        const data = await firebaseUsageServices.fetchDailyReport(userId, deviceId, appliances);

        set(state => ({
            reportHistory: {
                ...state.reportHistory,
                daily: {
                    ...state.reportHistory.daily,
                    [deviceId]: data
                }
            }
        }))
    },

    fetchDailyKwh: async (userId) => {
        const dailyKwh = await firebaseUsageServices.fetchDailyKwh(userId)
        set({
            reports: dailyKwh
        })
    }
}));