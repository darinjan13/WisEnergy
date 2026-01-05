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
    const fallbackRef = ref(
      db,
      `city/${locationVal}/${year}/${prevMonthStr}/rate`
    );
    const fallbackSnap = await get(fallbackRef);

    if (fallbackSnap.exists()) {
      console.warn(
        `⚠ No rate for current month; using fallback ${year}/${prevMonthStr}`
      );
      return fallbackSnap.val();
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

  const listener = onValue(budgetRef, (snap) => {
    const data = snap.val();

    if (!data) {
      callback(null);
      return;
    }

    const setAt = data?.set_at ? new Date(data.set_at) : null;
    const resetAt = setAt
      ? (() => {
        const d = new Date(setAt);
        d.setMonth(d.getMonth() + 1);
        return d;
      })()
      : null;

    callback({
      budget_php: data.budget_php,
      budget_kwh: data.budget_kwh,
      rate: data.rate,
      set_at: setAt,
      reset_at: resetAt,
    });
  });

  return () => off(budgetRef, "value");
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
