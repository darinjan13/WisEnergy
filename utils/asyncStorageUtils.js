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

export const saveWeeklyReportCache = async (userId, deviceId, data) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@weekly_report:${userId}:${deviceId}`;

    await AsyncStorage.setItem(
        key,
        JSON.stringify({ timestamp: todayStr, data })
    );
};

export const getWeeklyReportCache = async (userId, deviceId) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd', { timeZone: PH_TZ });
    const key = `@weekly_report:${userId}:${deviceId}`;

    try {
        const cacheStr = await AsyncStorage.getItem(key);
        if (cacheStr) {
            const cached = JSON.parse(cacheStr);
            if (cached.timestamp === todayStr && cached.data) {
                return cached.data;
            } else {
                console.log('Expired weekly cache');
                await AsyncStorage.removeItem(key);
            }
        }
        return null;
    } catch (error) {
        console.log('Error reading weekly report cache: ', error);
        return null;
    }
};

export const clearCache = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();

        const keysToRemove = keys.filter(
            (key) =>
                key.startsWith("@daily_report:") ||
                key.startsWith("@weekly_report:") ||
                key.startsWith("@top_appliances:") ||
                key.startsWith("@overall_top_appliances:") ||
                key.startsWith("@ai_insights:") ||
                key === "rememberedUser"
        );

        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
            console.log("🧹 Cache cleared:", keysToRemove);
        } else {
            console.log("✅ No cache keys to clear.");
        }
    } catch (error) {
        console.error("❌ Failed to clear cache:", error);
    }
};
