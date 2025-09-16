import { create } from 'zustand';
import * as firebaseDevicesServices from '../services/firebaseDevicesService'
import * as firebaseUsageServices from '../services/firebaseUsageService'
import * as firebaseBudgetServices from '../services/firebaseBudgetService'

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
    reset: () =>
        set({
            devices: [],
            userDevices: [],
            unpairedDevices: [],
            userAppliances: [],
        }),
}));

export const useUsageStore = create((set, get) => ({
    monthlyTotalConsumption: 0,
    _unsubMonthly: null,
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

    subscribeToMonthlyTotalConsumption: (userId) => {
        if (get()._unsubMonthly) return;

        const unsubscribe = firebaseUsageServices.fetchMonthlyTotalConsumption(userId, (currentConsumption) => {
            set({ monthlyTotalConsumption: currentConsumption });
        });

        set({ _unsubMonthly: unsubscribe });
    },

    unsubscribeFromMonthlyTotalConsumption: () => {
        const unsubMonthly = get()._unsubMonthly
        if (unsubMonthly) {
            unsubMonthly();
            set({ _unsubMonthly: null })
        }

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
        const data = await firebaseUsageServices.getCachedDailyReport(userId, deviceId, appliances);
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
    fetchWeeklyReport: async (userId, deviceId, appliances) => {
        const data = await firebaseUsageServices.getCacheWeeklyReport(userId, deviceId, appliances);

        set(state => ({
            reportHistory: {
                ...state.reportHistory,
                weekly: {
                    ...state.reportHistory.weekly,
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
    },
    reset: () => {
        // cleanup listener if still active
        const unsubMonthly = get()._unsubMonthly;
        if (unsubMonthly) unsubMonthly();

        set({
            monthlyTotalConsumption: 0,
            _unsubMonthly: null,
            latestKwh: [],
            reportHistory: { daily: {}, weekly: {}, monthly: {} },
            summaryPerDevice: {},
            totalConsumptionByDate: {},
            lastFetched: { daily: null, weekly: null, monthly: null },
        });
    },
}));

export const useBudgetStore = create((set, get) => ({
    locationRate: 0,
    monthlyBudget: null,
    _unsubBudget: null,
    percentUsed: 0,

    subscribeToBudget: (userId) => {
        if (get()._unsubBudget) return;

        const unsubscribe = firebaseBudgetServices.fetchMonthlyBudget(userId, (currentBudget) => {
            set({ monthlyBudget: currentBudget });
        });

        set({ _unsubBudget: unsubscribe });
    },

    unsubscribeToBudget: () => {
        const unsubBudget = get()._unsubBudget
        if (unsubBudget) {
            unsubBudget();
            set({ _unsubBudget: null, monthlyBudget: null })
        }

    },

    fetchPercentUsed: (usedKwh) => {
        const { locationRate } = get();
        const { monthlyBudget } = get();
        const estimatedCost = usedKwh * locationRate;
        const percentUsed = Math.min((estimatedCost / monthlyBudget?.budget_php) * 100, 100);

        set({ percentUsed });
    },
    fetchLocationRate: async (userId) => {
        const locationRate = await firebaseBudgetServices.fetchLocationRate(userId);

        set({ locationRate });
    },
    fetchMonthlyBudget: async (userId) => {

        const monthlyBudget = await firebaseBudgetServices.fetchMonthlyBudget(userId);
        set({ monthlyBudget });
    },
    reset: () => {
        const unsubBudget = get()._unsubBudget;
        if (unsubBudget) unsubBudget();
        set({
            locationRate: 0,
            monthlyBudget: null,
            _unsubBudget: null,
            percentUsed: 0,
        })
    }
}));

export const clearStates = () => {
    useDeviceStore.getState().reset();
    useUsageStore.getState().reset();
    useBudgetStore.getState().reset();
};