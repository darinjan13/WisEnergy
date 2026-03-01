import { create } from 'zustand';
import * as firebaseDevicesServices from '../services/firebaseDevicesService'
import * as firebaseUsageServices from '../services/firebaseUsageService'
import * as firebaseBudgetServices from '../services/firebaseBudgetService'
import * as firebaseNotificationServices from '../services/firebaseNotificationService'
import { persistWithExpiry } from "@/utils/persistWithExpiry";
import { daily_ai_insights } from '@/services/apiService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns-tz';

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
                set({ userAppliances: Array.isArray(userAppliances) ? [...userAppliances] : [] });
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

    toggleRelay: async (deviceId, value) => {
        await firebaseDevicesServices.toggleRelay(deviceId, value);
        set(state => ({
            userDevices: state.userDevices.map(d =>
                d.id === deviceId ? { ...d, relay_desired: value } : d
            )
        }));
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

const getNextFourHourCutoff = () => {
    const now = new Date();
    const phDateStr = format(now, "yyyy-MM-dd HH:mm:ss", { timeZone: 'PH_TZ' });
    const phNow = new Date(phDateStr.replace(" ", "T"));

    const hour = phNow.getHours();
    const nextBlockHour = Math.ceil((hour + 1) / 4) * 4 % 24;

    const cutoff = new Date(phNow);
    cutoff.setMinutes(0, 0, 0);
    cutoff.setHours(nextBlockHour);

    if (nextBlockHour <= hour) {
        cutoff.setDate(cutoff.getDate() + 1);
    }

    return cutoff.getTime();
};

export const useAiGeneratedStore = create((set) => ({
    insights: [],
    recommendations: [],

    fetchDailyAiGeneratedContent: async (userId, date) => {
        const key = `@ai_insights:${userId}:${date}`;
        try {
            // 1) Read cache
            const cachedStr = await AsyncStorage.getItem(key);
            if (cachedStr) {
                const cached = JSON.parse(cachedStr);
                if (cached?.timestamp === date && cached?.expiresAt && Date.now() < cached.expiresAt) {
                    set({
                        insights: cached.data.insights || [],
                        recommendations: cached.data.recommendations || [],
                    });
                    return cached.data;
                } else {
                    // expired → clean up
                    await AsyncStorage.removeItem(key);
                }
            }

            // 2) Fetch fresh
            const result = await daily_ai_insights(userId, date);
            if (result) {
                const { insights = [], recommendations = [] } = result;

                set({ insights, recommendations });

                // 3) Save with 4-hour PH cutoff
                await AsyncStorage.setItem(
                    key,
                    JSON.stringify({
                        timestamp: date,
                        expiresAt: getNextFourHourCutoff(),
                        data: { insights, recommendations },
                    }),
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


export const useUsageStore = create(
    persistWithExpiry(
        (set, get) => ({
            // ---------- STATE ---------- 
            monthlyTotalConsumption: 0,
            allMonthlyTotalConsumption: [],
            latestKwh: {},
            topAppliances: [],
            todayTrend: null,

            // ---------- REPORT DATA CHUNKS ---------- 
            dailyData: {
                dailyTotals: [],
                dailyReport: [],
            },
            weeklyData: {
                weeklyTotals: [],
                weeklyReport: [],
            },
            monthlyData: {
                monthlyTotals: [],
                monthlyReport: [],
            },

            // ---------- FETCH FUNCTIONS ---------- 
            fetchTopAppliances: async (userId) => {
                try {
                    const data = await firebaseUsageServices.fetchTopAppliances(userId);
                    set({ topAppliances: data });
                } catch (err) {
                    console.error("⚠️ fetchTopAppliances:", err);
                    set({ topAppliances: [] });
                }
            },

            fetchTodayTrend: async (userId) => {
                try {
                    const trend = await firebaseUsageServices.fetchTodayTrend(userId);
                    set({ todayTrend: trend });
                } catch (err) {
                    console.error("⚠️ fetchTodayTrend:", err);
                    set({ todayTrend: null });
                }
            },

            fetchLatestMonthlyTotalConsumption: async (userId) => {
                try {
                    const total = await firebaseUsageServices.fetchLatestMonthlyTotalConsumption(userId);
                    set({ monthlyTotalConsumption: total });
                } catch (err) {
                    console.error("⚠️ fetchLatestMonthlyTotalConsumption:", err);
                    set({ monthlyTotalConsumption: 0 });
                }
            },

            fetchAllMonthlyTotalConsumption: async (userId) => {
                try {
                    const all = await firebaseUsageServices.fetchAllMonthlyTotalConsumption(userId);
                    set({ allMonthlyTotalConsumption: all });
                } catch (err) {
                    console.error("⚠️ fetchAllMonthlyTotalConsumption:", err);
                    set({ allMonthlyTotalConsumption: [] });
                }
            },

            fetchAllLatestKwh: async (userId, deviceId) => {
                try {
                    const latest = await firebaseUsageServices.fetchAllLatestKwh(userId, deviceId);
                    set({ latestKwh: latest });
                } catch (err) {
                    console.error("⚠️ fetchAllLatestKwh:", err);
                    set({ latestKwh: {} });
                }
            },

            // ---------- REPORT FETCH (per category) ----------
            fetchDailyReport: async (userId, deviceId, appliances) => {
                try {
                    const data = await firebaseUsageServices.fetchDailyReport(userId, deviceId, appliances);
                    set((state) => ({
                        dailyData: {
                            ...state.dailyData,
                            dailyReport: {
                                ...state.dailyData.dailyReport,
                                [deviceId]: data,
                            },
                        },
                    }));
                } catch (err) {
                    console.error("⚠️ fetchDailyReport:", err);
                }
            },

            fetchWeeklyReport: async (userId, deviceId, appliances) => {
                try {
                    const data = await firebaseUsageServices.fetchWeeklyReport(userId, deviceId, appliances);
                    set((state) => ({
                        weeklyData: {
                            ...state.weeklyData,
                            weeklyReport: {
                                ...state.weeklyData.weeklyReport,
                                [deviceId]: data,
                            },
                        },
                    }));
                } catch (err) {
                    console.error("⚠️ fetchWeeklyReport:", err);
                }
            },

            fetchMonthlyReport: async (userId, deviceId, appliances) => {
                try {
                    const data = await firebaseUsageServices.fetchMonthlyReport(userId, deviceId, appliances);
                    set((state) => ({
                        monthlyData: {
                            ...state.monthlyData,
                            monthlyReport: {
                                ...state.monthlyData.monthlyReport,
                                [deviceId]: data,
                            },
                        },
                    }));
                } catch (err) {
                    console.error("⚠️ fetchMonthlyReport:", err);
                }
            },

            // ---------- TOTAL FETCH (per category) ----------
            fetchDailyTotals: async (userId) => {

                try {
                    const data = await firebaseUsageServices.fetchDailyTotalConsumption(userId);

                    // set({ dailyData: { ...get().dailyData, dailyTotals: data } });
                    set((state) => ({
                        dailyData: {
                            ...state.dailyData,
                            dailyTotals: data
                        }
                    }))
                } catch (err) {
                    console.error("⚠️ fetchDailyTotals:", err);
                }
            },

            fetchWeeklyTotals: async (userId) => {
                try {
                    const data = await firebaseUsageServices.fetchWeeklyTotalConsumption(userId);
                    set((state) => ({
                        weeklyData: {
                            ...state.weeklyData,
                            weeklyTotals: data
                        }
                    }))
                } catch (err) {
                    console.error("⚠️ fetchWeeklyTotals:", err);
                }
            },

            fetchMonthlyTotals: async (userId) => {
                try {
                    const data = await firebaseUsageServices.fetchMonthlyTotalConsumption(userId);
                    set((state) => ({
                        monthlyData: {
                            ...state.monthlyData,
                            monthlyTotals: data
                        }
                    }))
                } catch (err) {
                    console.error("⚠️ fetchMonthlyTotals:", err);
                }
            },

            reset: () =>
                set({
                    monthlyTotalConsumption: 0,
                    allMonthlyTotalConsumption: [],
                    latestKwh: {},
                    topAppliances: [],
                    todayTrend: null,
                    dailyData: { dailyTotals: [], dailyReport: [] },
                    weeklyData: { weeklyTotals: [], weeklyReport: [] },
                    monthlyData: { monthlyTotals: [], monthlyReport: [] },
                }),
        }),
        {
            name: "usage-store",
            ttl: 1000 * 60 * 60, // 1 hour expiry
            partialize: (state) => ({
                topAppliances: state.topAppliances,
                allMonthlyTotalConsumption: state.allMonthlyTotalConsumption,
                dailyData: state.dailyData,
                weeklyData: state.weeklyData,
                monthlyData: state.monthlyData,
            }),
        }
    )
);


export const useBudgetStore = create((set, get) => ({
    locationRate: 0,
    allBudget: [],
    monthlyBudget: undefined,
    budgetReady: false,
    _unsubBudget: null,
    percentUsed: 0,

    subscribeToBudget: (userId) => {
        if (get()._unsubBudget) return;

        set({ monthlyBudget: undefined, budgetReady: false });

        const unsubscribe = firebaseBudgetServices.fetchMonthlyBudget(userId, (currentBudget) => {
            set({
                monthlyBudget: currentBudget, // null or object
                budgetReady: true,
            });
        });

        set({ _unsubBudget: unsubscribe });
    },

    unsubscribeToBudget: () => {
        const unsubBudget = get()._unsubBudget;
        if (unsubBudget) {
            unsubBudget();
            set({ _unsubBudget: null, monthlyBudget: undefined, budgetReady: false });
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