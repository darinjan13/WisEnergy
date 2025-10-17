import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns-tz';

const PH_TZ = 'Asia/Manila';
const HOUR_MS = 60 * 60 * 1000;

/* -------------------- DAILY (expire every hour) -------------------- */
export const saveDailyReportCache = async (userId, deviceId, data) => {
    const key = `@daily_report:${userId}:${deviceId}`;
    const storedAt = Date.now(); // epoch ms
    await AsyncStorage.setItem(key, JSON.stringify({ storedAt, data }));
};

export const getDailyReportCache = async (userId, deviceId) => {
    const key = `@daily_report:${userId}:${deviceId}`;
    try {
        const cacheStr = await AsyncStorage.getItem(key);
        if (!cacheStr) return null;

        const cached = JSON.parse(cacheStr);
        if (cached?.storedAt && Date.now() - cached.storedAt < HOUR_MS && cached.data) {
            return cached.data;
        }

        // expired
        await AsyncStorage.removeItem(key);
        return null;
    } catch (error) {
        console.log('Error reading daily report cache: ', error);
        return null;
    }
};

/* -------------------- WEEKLY (expires next day) -------------------- */
export const saveWeeklyReportCache = async (userId, deviceId, data) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@weekly_report:${userId}:${deviceId}`;
    await AsyncStorage.setItem(key, JSON.stringify({ timestamp: todayStr, data }));
};

export const getWeeklyReportCache = async (userId, deviceId) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@weekly_report:${userId}:${deviceId}`;
    try {
        const cacheStr = await AsyncStorage.getItem(key);
        if (cacheStr) {
            const cached = JSON.parse(cacheStr);
            if (cached.timestamp === todayStr && cached.data) return cached.data;
            await AsyncStorage.removeItem(key); // expired
        }
        return null;
    } catch (error) {
        console.log('Error reading weekly report cache: ', error);
        return null;
    }
};

/* -------------------- MONTHLY (expires next day) -------------------- */
export const saveMonthlyReportCache = async (userId, deviceId, data) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@monthly_report:${userId}:${deviceId}`;
    await AsyncStorage.setItem(key, JSON.stringify({ timestamp: todayStr, data }));
};

export const getMonthlyReportCache = async (userId, deviceId) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@monthly_report:${userId}:${deviceId}`;
    try {
        const cacheStr = await AsyncStorage.getItem(key);
        if (cacheStr) {
            const cached = JSON.parse(cacheStr);
            if (cached.timestamp === todayStr && cached.data) return cached.data;
            await AsyncStorage.removeItem(key); // expired
        }
        return null;
    } catch (error) {
        console.log('Error reading monthly report cache: ', error);
        return null;
    }
};

/* 🔹 Daily totals (expire hourly) */
export const saveDailyTotalsCache = async (userId, data) => {
    const key = `@daily_totals:${userId}`;
    const storedAt = Date.now();
    await AsyncStorage.setItem(key, JSON.stringify({ storedAt, data }));
};

export const getDailyTotalsCache = async (userId) => {
    const key = `@daily_totals:${userId}`;
    try {
        const cacheStr = await AsyncStorage.getItem(key);
        if (!cacheStr) return null;

        const cached = JSON.parse(cacheStr);
        if (cached?.storedAt && Date.now() - cached.storedAt < HOUR_MS && cached.data) {
            return cached.data;
        }

        await AsyncStorage.removeItem(key); // expired
        return null;
    } catch (error) {
        console.log('Error reading daily totals cache:', error);
        return null;
    }
};

/* 🔹 Weekly totals (expires next day) */
export const saveWeeklyTotalsCache = async (userId, data) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@weekly_totals:${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify({ timestamp: todayStr, data }));
};

export const getWeeklyTotalsCache = async (userId) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@weekly_totals:${userId}`;
    try {
        const cacheStr = await AsyncStorage.getItem(key);
        if (cacheStr) {
            const cached = JSON.parse(cacheStr);
            if (cached.timestamp === todayStr && cached.data) return cached.data;
            await AsyncStorage.removeItem(key); // expired
        }
        return null;
    } catch (error) {
        console.log('Error reading weekly totals cache:', error);
        return null;
    }
};

/* 🔹 Monthly totals (expires next day) */
export const saveMonthlyTotalsCache = async (userId, data) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@monthly_totals:${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify({ timestamp: todayStr, data }));
};

export const getMonthlyTotalsCache = async (userId) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@monthly_totals:${userId}`;
    try {
        const cacheStr = await AsyncStorage.getItem(key);
        if (cacheStr) {
            const cached = JSON.parse(cacheStr);
            if (cached.timestamp === todayStr && cached.data) return cached.data;
            await AsyncStorage.removeItem(key); // expired
        }
        return null;
    } catch (error) {
        console.log('Error reading monthly totals cache:', error);
        return null;
    }
};

/* -------------------- CLEAR -------------------- */
export const clearCache = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();

        const keysToRemove = keys.filter(
            (key) =>
                key.startsWith('@daily_report:') ||
                key.startsWith('@weekly_report:') ||
                key.startsWith('@monthly_report:') ||
                key.startsWith('@daily_totals:') ||
                key.startsWith('@weekly_totals:') ||
                key.startsWith('@monthly_totals:') ||
                key.startsWith('@top_appliances:') ||
                key.startsWith('@overall_top_appliances:') ||
                key.startsWith('@ai_insights:') ||
                key === 'rememberedUser'
        );

        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
            console.log('🧹 Cache cleared:', keysToRemove);
        } else {
            console.log('✅ No cache keys to clear.');
        }
    } catch (error) {
        console.error('❌ Failed to clear cache:', error);
    }
};