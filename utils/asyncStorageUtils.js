import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Clears selected persisted Zustand caches and other local data.
 * Automatically includes useUsageStore (usage-store) and related keys.
 */
export const clearCache = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();

        // 🧩 Add your Zustand store names here:
        const keysToRemove = keys.filter(
            (key) =>
                key === "usage-store" ||            // your useUsageStore
                key === "budget-store" ||           // if you have one for budget
                key === "device-store" ||           // if you persist devices
                key === "ai-store" ||               // for AI insights
                key.startsWith("@Totals:") ||
                key.startsWith("@overall_top_appliances:") ||
                key.startsWith("@ai_insights:") ||
                key === "rememberedUser" ||
                key === "rememberedEmail"
        );

        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
            console.log("🧹 Cache cleared:", keysToRemove);
        } else {
            console.log("✅ No cache keys found to clear.");
        }
    } catch (error) {
        console.error("❌ Failed to clear cache:", error);
    }
};
