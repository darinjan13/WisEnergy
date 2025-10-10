import { create } from 'zustand';
import * as firebaseDevicesServices from '../services/firebaseDevicesService'
import * as firebaseUsageServices from '../services/firebaseUsageService'
import * as firebaseBudgetServices from '../services/firebaseBudgetService'
import * as firebaseNotificationServices from '../services/firebaseNotificationService'
import { daily_ai_insights } from '@/services/apiService'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useDeviceStore = create((set, get) => ({
    devices: [],
    userDevices: [],
    unpairedDevices: [],
    userAppliances: [],
    _unsubUserAppliances: null,
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
    listenToUserAppliances: (userId) => {
        const unsubscribe = firebaseDevicesServices.listenToUserAppliances(userId,
            (userAppliances) => {
                set({ userAppliances });
            }
        );

        set({ _unsubUserAppliances: unsubscribe });
    },

    unsubscribeFromUserAppliances: () => {
        const unsubUserAppliances = get()._unsubUserAppliances
        if (unsubUserAppliances) {
            unsubUserAppliances();
            set({ _unsubUserAppliances: null })
        }
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
            _unsubUserAppliances: null,
        }),
}));

export const useAiGeneratedStore = create((set) => ({
    insights: [],
    recommendations: [],

    fetchDailyAiGeneratedContent: async (userId, date) => {
        const key = `@ai_insights:${userId}:${date}`;

        try {
            // 1. Check cache
            const cachedStr = await AsyncStorage.getItem(key);
            if (cachedStr) {
                const cached = JSON.parse(cachedStr);

                if (cached.timestamp === date) {
                    set({
                        insights: cached.data.insights || [],
                        recommendations: cached.data.recommendations || [],
                    });
                    return cached.data;
                }
            }

            // 2. Fetch fresh
            const result = await daily_ai_insights(userId, date);
            if (result) {
                const { insights = [], recommendations = [] } = result;

                // update store
                set({ insights, recommendations });

                // 3. Save cache
                await AsyncStorage.setItem(
                    key,
                    JSON.stringify({
                        timestamp: date,
                        data: { insights, recommendations },
                    })
                );

                return { insights, recommendations };
            }
        } catch (err) {
            console.error("AI fetch error:", err);
        }
    },
    reset: () =>
        set({
            insights: [],
            recommendations: [],
        }),
}));


export const useUsageStore = create((set, get) => ({
    monthlyTotalConsumption: 0,
    allMonthlyTotalConsumption: [],
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
    todayTrend: null,
    topAppliances: [],

    dailyTotals: [],
    weeklyTotals: [],
    monthlyTotals: [],
    fetchTopAppliances: async (userId) => {
        try {
            const top = await firebaseUsageServices.fetchTopAppliances(userId);
            set({ topAppliances: top });
            return top;
        } catch (err) {
            console.error("Error in store.fetchTopAppliances:", err);
            set({ topAppliances: [] });
            return [];
        }
    },
    subscribeToMonthlyTotalConsumption: (userId) => {
        if (get()._unsubMonthly) return;

        const unsubscribe = firebaseUsageServices.fetchMonthlyTotalConsumptionRealtime(userId, (currentConsumption) => {
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

    fetchAllLatestKwh: async (userId, deviceId) => {
        const latestKwh = await firebaseUsageServices.fetchAllLatestKwh(userId, deviceId);
        set({
            latestKwh
        });
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
        const data = await firebaseUsageServices.getCachedWeeklyReport(userId, deviceId, appliances);

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

    fetchMonthlyReport: async (userId, deviceId, appliances) => {
        const data = await firebaseUsageServices.getCachedMonthlyReport(userId, deviceId, appliances);

        set(state => ({
            reportHistory: {
                ...state.reportHistory,
                monthly: {
                    ...state.reportHistory.monthly,
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
    fetchAllMonthlyTotalConsumption: async (userId) => {
        const allMonthlyTotalConsumption = await firebaseUsageServices.fetchAllMonthlyTotalConsumption(userId)

        set({ allMonthlyTotalConsumption })
    },
    fetchTodayTrend: async (userId) => {
        const todayTrend = await firebaseUsageServices.fetchTodayTrend(userId);
        set({
            todayTrend
        })
    },
    fetchDailyTotals: async (userId) => {
        const data = await firebaseUsageServices.getCachedDailyTotalConsumption(userId);
        set({ dailyTotals: data });
    },

    fetchWeeklyTotals: async (userId) => {
        const data = await firebaseUsageServices.getCachedWeeklyTotalConsumption(userId);
        set({ weeklyTotals: data });
    },

    fetchMonthlyTotals: async (userId) => {
        const data = await firebaseUsageServices.getCachedMonthlyTotalConsumption(userId);
        set({ monthlyTotals: data });
    },
    reset: () => {
        // cleanup listener if still active
        const unsubMonthly = get()._unsubMonthly;
        if (unsubMonthly) unsubMonthly();

        set({
            monthlyTotalConsumption: 0,
            _unsubMonthly: null,
            allMonthlyTotalConsumption: [],
            latestKwh: [],
            reportHistory: { daily: {}, weekly: {}, monthly: {} },
            summaryPerDevice: {},
            totalConsumptionByDate: {},
            lastFetched: { daily: null, weekly: null, monthly: null },
            todayTrend: null,
            topAppliances: [],
            dailyTotals: [],
            weeklyTotals: [],
            monthlyTotals: [],
        });
    },
}));

export const useBudgetStore = create((set, get) => ({
    locationRate: 0,
    allBudget: [],
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
    fetchAllBudget: async (userId) => {
        const allBudget = await firebaseBudgetServices.fetchAllBudget(userId);
        set({ allBudget });
    },
    reset: () => {
        const unsubBudget = get()._unsubBudget;
        if (unsubBudget) unsubBudget();
        set({
            locationRate: 0,
            monthlyBudget: null,
            _unsubBudget: null,
            percentUsed: 0,
            allBudget: []
        })
    }
}));

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    loading: false,
    hasMore: true,
    lastTimestamp: null,
    PAGE_SIZE: 5,

    /** Fetch first page or refresh list */
    fetchNotifications: async (userId) => {
        if (!userId) return;
        set({ loading: true });

        const { notifications, newLastTimestamp, hasMore } =
            await firebaseNotificationServices.fetchUserNotifications(userId, null, get().PAGE_SIZE);

        set({
            notifications,
            lastTimestamp: newLastTimestamp,
            hasMore,
            loading: false,
        });
    },
    loadMoreNotifications: async (userId) => {
        const { lastTimestamp, PAGE_SIZE, notifications } = get();
        if (!userId || !lastTimestamp) return;
        set({ loading: true });

        const { notifications: newData, newLastTimestamp, hasMore } =
            await firebaseNotificationServices.fetchUserNotifications(userId, lastTimestamp, PAGE_SIZE);

        // 🧠 remove duplicates (same Firebase ID)
        const existingIds = new Set(notifications.map((n) => n.id));
        const merged = [
            ...notifications,
            ...newData.filter((n) => !existingIds.has(n.id)),
        ];

        set({
            notifications: merged,
            lastTimestamp: newLastTimestamp,
            hasMore,
            loading: false,
        });
    },
    markAllAsRead: async (userId) => {
        const { notifications } = get();
        if (!userId) return;

        await firebaseNotificationServices.markAllNotificationsRead(userId, notifications);

        const now = new Date().toISOString();
        set({
            notifications: notifications.map((n) => ({ ...n, read_at: now })),
        });
    },
    deleteNotification: async (userId, notifId) => {
        if (!userId || !notifId) return;
        try {
            await firebaseNotificationServices.deleteNotification(userId, notifId);
            set({
                notifications: get().notifications.filter((n) => n.id !== notifId),
            });
        } catch (e) {
            console.error("⚠️ Failed to delete notification:", e);
        }
    },
    reset: () => {
        set({
            notifications: [],
            loading: false,
            hasMore: true,
            lastTimestamp: null,
        });
    },
}))

export const clearStates = () => {
    useDeviceStore.getState().reset();
    useUsageStore.getState().reset();
    useBudgetStore.getState().reset();
    useAiGeneratedStore.getState().reset();
    useNotificationStore.getState().reset();
};