import { db } from "@/firebase/firebaseConfig";
import { get, off, onValue, ref } from "firebase/database";

export const fetchLocationRate = async (userId) => {
    const userRef = ref(db, `users/${userId}/location`);
    const location = await get(userRef);
    const formattedLocation = location.val().replace(/ /g, "_");
    const rateRef = ref(db, `city/${formattedLocation}/rate`);
    const getRate = await get(rateRef);
    return getRate.val();
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
                const rate = Number(budgetData[year][month].rate);

                // Check if budget_kwh and rate are valid numbers
                if (!isNaN(budgetKwh) && !isNaN(rate) && rate !== 0) {
                    const calculatedValue = (budgetKwh / rate).toFixed(2); // Calculate the budget value
                    monthlyBudgets.push({
                        month,
                        value: Number(calculatedValue),
                        dataPointText: Number(calculatedValue),
                    });
                }
            }
        }
    }

    return monthlyBudgets;
};
