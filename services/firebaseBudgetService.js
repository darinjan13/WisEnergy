import { db } from "@/firebase/firebaseConfig";
import { getMonthName } from "@/utils/dateHelper";
import { get, off, onValue, ref } from "firebase/database";

/* --------------------------------------------
   Helper: Avoid JS thread freeze
-------------------------------------------- */
const microtask = () => new Promise((res) => setTimeout(res, 0));

/* --------------------------------------------
   1️⃣ Fetch electricity rate for user's location
-------------------------------------------- */
export const fetchLocationRate = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}/location`);
    const locationSnap = await get(userRef);

    if (!locationSnap.exists()) {
      console.warn("⚠ No location found for user:", userId);
      return null;
    }

    const locationVal = locationSnap.val().trim().replace(/\s+/g, "_");

    const now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, "0");

    // Try current month
    let rateRef = ref(db, `city/${locationVal}/${year}/${month}/rate`);
    let rateSnap = await get(rateRef);
    if (rateSnap.exists()) return rateSnap.val();

    // Try previous month
    let prevMonth = now.getMonth();
    if (prevMonth === 0) {
      prevMonth = 12;
      year -= 1;
    }
    const prevMonthStr = String(prevMonth).padStart(2, "0");
    const fallbackRef = ref(db, `city/${locationVal}/${year}/${prevMonthStr}/rate`);
    const fallbackSnap = await get(fallbackRef);
    if (fallbackSnap.exists()) return fallbackSnap.val();

    // ← NEW: scan all years/months and return the latest available rate
    console.warn("⚠ No recent rate found, scanning for latest available...");
    const cityRef = ref(db, `city/${locationVal}`);
    const citySnap = await get(cityRef);
    if (!citySnap.exists()) return null;

    const cityData = citySnap.val();
    let latestRate = null;
    let latestKey = "";

    for (const y of Object.keys(cityData).sort()) {
      for (const m of Object.keys(cityData[y]).sort()) {
        const rate = cityData[y][m]?.rate;
        if (rate !== undefined) {
          const key = `${y}-${m}`;
          if (key > latestKey) {
            latestKey = key;
            latestRate = rate;
          }
        }
      }
    }

    if (latestRate !== null) {
      console.warn(`⚠ Using latest available rate from ${latestKey}`);
      return latestRate;
    }

    return null;
  } catch (e) {
    console.error("❌ fetchLocationRate error:", e);
    return null;
  }
};
/* --------------------------------------------
   2️⃣ Real-time Monthly Budget Listener
-------------------------------------------- */
export const fetchMonthlyBudget = (userId, callback) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");

  const budgetRef = ref(db, `user_monthly_budget/${userId}/${y}/${m}`);

  const unsubscribe = onValue(budgetRef, (snap) => {
    const data = snap.val();

    if (!data) {
      callback(null);
      return;
    }

    const setAt = data?.set_at ? new Date(data.set_at) : null;
    const resetAt = setAt ? new Date(setAt.getFullYear(), setAt.getMonth() + 1, 1) : null;

    callback({
      budget_php: data.budget_php,
      budget_kwh: data.budget_kwh,
      rate: data.rate,
      set_at: setAt,
      reset_at: resetAt,
    });
  });

  return unsubscribe;
};

/* --------------------------------------------
   3️⃣ Fetch ALL Monthly Budgets (History)
-------------------------------------------- */
export const fetchAllBudget = async (userId) => {
  try {
    const rootRef = ref(db, `user_monthly_budget/${userId}`);
    const snap = await get(rootRef);

    if (!snap.exists()) return [];

    const monthlyBudgets = [];
    const yearBlock = snap.val();
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear = String(new Date().getFullYear());

    for (const year in yearBlock) {
      if (year !== currentYear) continue;
      await microtask();

      for (const month in yearBlock[year]) {
        const entry = yearBlock[year][month];
        const budgetKwh = Number(entry?.budget_kwh);

        if (!isNaN(budgetKwh)) {
          monthlyBudgets.push({
            label: getMonthName(month, "short"),
            value: budgetKwh,
            dataPointText: budgetKwh,
          });
        }
      }
    }

    // Sort based on actual month order
    monthlyBudgets.sort(
      (a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label)
    );

    return monthlyBudgets;
  } catch (e) {
    console.error("❌ fetchAllBudget error:", e);
    return [];
  }
};
