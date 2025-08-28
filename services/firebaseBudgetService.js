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
    const budgetRef = ref(db, `user_monthly_budget/${userId}/${year}/${month}/budget_php`);
    // const snapshot = await get(budgetRef);
    const listener = onValue(budgetRef, (snapshot) => {
        callback(snapshot.val())
    })
    // if (snapshot.exists()) {
    //     return snapshot.val();
    // } else {
    //     return 0;
    // }

    return () => off(budgetRef, 'value')
}