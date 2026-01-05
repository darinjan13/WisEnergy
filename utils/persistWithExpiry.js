import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const persistWithExpiry = (config, options) => {
    const { ttl = 0, ...persistOptions } = options;

    return persist(
        (set, get, api) => {
            const wrappedSet = (fn) => {
                const result = typeof fn === "function" ? fn(get()) : fn;

                if (ttl > 0) {
                    const now = new Date();
                    const nextHour = new Date(now);
                    nextHour.setMinutes(0, 0, 0);
                    nextHour.setHours(now.getHours() + 1);

                    const expiry = nextHour.getTime();

                    return set({
                        ...result,
                        _persistMeta: { ...(get()._persistMeta || {}), expiry },
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
                    AsyncStorage.removeItem(persistOptions.name).catch(() => { });
                    state?.reset?.();
                }
            },
        }
    );
};
