import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * persistWithExpiry
 * Wraps Zustand's persist() to add expiry support.
 *
 * @param {Function} config - Zustand store definition
 * @param {Object} options - persist options + { ttl: number in ms }
 */
export const persistWithExpiry = (config, options) => {
    const { ttl = 0, ...persistOptions } = options;

    return persist(
        (set, get, api) => {
            const wrappedSet = (fn) => {
                const result = typeof fn === "function" ? fn(get()) : fn;

                // If ttl is greater than 0, calculate the expiry
                if (ttl > 0) {
                    // Check if the data is dailyData
                    const isDailyData = result?.dailyData !== undefined;  // You can check based on the structure of the data
                    let expiry;

                    if (isDailyData) {
                        // Hourly expiry for dailyData (next full hour)
                        const now = new Date();
                        const nextFullHour = new Date(now);
                        nextFullHour.setMinutes(0, 0, 0);  // Set minutes, seconds, milliseconds to 0
                        nextFullHour.setHours(now.getHours() + 1);  // Move to next full hour
                        expiry = nextFullHour.getTime();
                    } else {
                        // Midnight expiry for other data (next 12 AM)
                        const now = new Date();
                        const nextMidnight = new Date(now);
                        nextMidnight.setHours(24, 0, 0, 0);  // Set to 12 AM of the next day
                        expiry = nextMidnight.getTime();
                    }

                    return set({
                        ...result,
                        _persistMeta: { ...result._persistMeta, expiry },
                    });
                }

                return set(result);
            };

            return config(wrappedSet, get, api);
        },
        {
            ...persistOptions,
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                const expiry = state?._persistMeta?.expiry;
                if (expiry && Date.now() > expiry) {
                    console.log("🧹 Zustand persist expired:", persistOptions.name);
                    AsyncStorage.removeItem(persistOptions.name);
                    return {}; // Reset store if expired
                }
            },
        }
    );
};
