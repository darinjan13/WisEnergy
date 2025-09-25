import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns-tz';

const PH_TZ = 'Asia/Manila';

export const saveDailyReportCache = async (userId, deviceId, data) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@daily_report:${userId}:${deviceId}`;

    await AsyncStorage.setItem(
        key,
        JSON.stringify({ timestamp: todayStr, data })
    );
};

export const getDailyReportCache = async (userId, deviceId) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@daily_report:${userId}:${deviceId}`;

    try {
        const cacheStr = await AsyncStorage.getItem(key);
        if (cacheStr) {
            const cached = JSON.parse(cacheStr);
            if (cached.timestamp === todayStr && cached.data) {
                return cached.data;
            } else {
                console.log("Expired");
                await AsyncStorage.removeItem(key);
            }
        }

        return null;
    } catch (error) {
        console.log("Error reading daily report cache: ", error);

    }
};

const makeCacheKey = (scope, period, userId, deviceId) => {
    return `@report:${scope}:${period}:${userId}:${deviceId}`;
};

// 🔹 Save cache
export const saveReportCache = async (scope, period, userId, deviceId, data) => {
    // for daily reports → expire daily
    const todayStr = format(new Date(), "yyyy-MM-dd", { timeZone: PH_TZ });

    await AsyncStorage.setItem(
        makeCacheKey(scope, period, userId, deviceId),
        JSON.stringify({ timestamp: todayStr, data })
    );
};

// 🔹 Get cache
export const getReportCache = async (scope, period, userId, deviceId) => {
    const todayStr = format(new Date(), "yyyy-MM-dd", { timeZone: PH_TZ });

    try {
        const cacheStr = await AsyncStorage.getItem(
            makeCacheKey(scope, period, userId, deviceId)
        );
        if (cacheStr) {
            const cached = JSON.parse(cacheStr);
            if (cached.timestamp === todayStr && cached.data) {
                return cached.data;
            } else {
                console.log("Expired", scope, period);
                await AsyncStorage.removeItem(
                    makeCacheKey(scope, period, userId, deviceId)
                );
            }
        }
        return null;
    } catch (error) {
        console.log("Error reading cache: ", error);
        return null;
    }
};

export const clearReportCache = async (userId) => {
    try {
        const keys = await AsyncStorage.getAllKeys();

        const keysToRemove = keys.filter(
            (key) =>
                key.startsWith(`@daily_report:${userId}:`) ||
                key.includes(`:${userId}:`)
        );

        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
            console.log("Cleared report cache:", keysToRemove);
        } else {
            console.log("No cache keys found for user:", userId);
        }
    } catch (error) {
        console.error("Error clearing report cache:", error);
    }
};

// export const clearCache = async () => {
//     try {
//         const keys = await AsyncStorage.getAllKeys();
//         const keysToRemove = keys.filter(key =>
//             key.startsWith('@daily_report:') ||
//             key === 'rememberedUser'
//         );

//         if (keysToRemove.length > 0) {
//             await AsyncStorage.multiRemove(keysToRemove);
//             console.log('🧹 Cache cleared:', keysToRemove);
//         } else {
//             console.log('✅ No cache keys to clear.');
//         }
//     } catch (error) {
//         console.error('❌ Failed to clear cache:', error);
//     }
// }