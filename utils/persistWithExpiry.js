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
                if (ttl > 0) {
                    return set({
                        ...result,
                        _persistMeta: { ...result._persistMeta, expiry: Date.now() + ttl },
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
                    return {}; // Reset store
                }
            },
        }
    );
};
