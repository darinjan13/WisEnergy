import { db } from "@/firebase/firebaseConfig";
import { get, off, onValue, ref } from "firebase/database";

export const fetchLocationRate = async (userId) => {
    try {
        // 1️⃣ Get user's saved location
        const userRef = ref(db, `users/${userId}/location`);
        const locationSnap = await get(userRef);

        if (!locationSnap.exists()) {
            console.warn("⚠️ No location found for user:", userId);
            return null;
        }

        const locationVal = locationSnap.val().trim().replace(/\s+/g, "_");

        // 2️⃣ Get current year and month
        const now = new Date();
        let year = now.getFullYear();
        let month = String(now.getMonth() + 1).padStart(2, "0");

        // 3️⃣ Try current month first
        let rateRef = ref(db, `city/${locationVal}/${year}/${month}/rate`);
        let rateSnap = await get(rateRef);

        if (rateSnap.exists()) {
            return rateSnap.val();
        }

        // 4️⃣ Fallback to previous month
        let prevMonth = now.getMonth(); // previous month index
        if (prevMonth === 0) {
            prevMonth = 12; // wrap to December
            year -= 1;
        }

        const prevMonthStr = String(prevMonth).padStart(2, "0");
        const fallbackRef = ref(db, `city/${locationVal}/${year}/${prevMonthStr}/rate`);
        const fallbackSnap = await get(fallbackRef);

        if (fallbackSnap.exists()) {
            console.warn(`⚠️ No rate found for current month; using ${year}/${prevMonthStr}`);
            return fallbackSnap.val();
        }

        console.warn("⚠️ No rate data found for current or previous month.");
        return null;
    } catch (error) {
        console.error("❌ Error fetching location rate:", error);
        return null;
    }
}

export const fetchMonthlyBudget = (userId, callback) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const budgetRef = ref(db, `user_monthly_budget/${userId}/${year}/${month}`);
    const listener = onValue(budgetRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
            let formattedData = {
                budget_php: data.budget_php,
                budget_kwh: data.budget_kwh,
                rate: data.rate,
                set_at: data?.set_at ? new Date(data.set_at) : null,
                reset_at: data?.set_at ? (() => {
                    const d = new Date(data.set_at);
                    d.setMonth(d.getMonth() + 1);
                    return d;
                })() : null
            };
            callback(formattedData);
        } else {
            callback(null);
        }
    })

    return () => off(budgetRef, 'value')
}

export const fetchAllBudget = async (userId) => {
    const budgetRef = ref(db, `user_monthly_budget/${userId}`);
    const budgetSnapshot = await get(budgetRef);

    const monthlyBudgets = [];

    if (budgetSnapshot.exists()) {
        const budgetData = budgetSnapshot.val();
        for (const year in budgetData) {
            for (const month in budgetData[year]) {
                const budgetKwh = Number(budgetData[year][month].budget_kwh);
                // Check if budget_kwh and rate are valid numbers
                if (!isNaN(budgetKwh)) {
                    monthlyBudgets.push({
                        label: month,
                        value: Number(budgetKwh),
                        dataPointText: Number(budgetKwh),
                    });
                }
            }
        }
    }
    monthlyBudgets.sort((a, b) => parseInt(a.label) - parseInt(b.label));
    return monthlyBudgets;
};
