# Reports Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite Reports so it never reads more than what's on screen, never hangs on cold predictions, and renders the same features in a calmer order — ending the silent memory-death.

**Architecture:** Bounded service readers (keyed `get()` + `limitToLast(30)`, 8s prediction cap, dev read-size log) under unchanged store shapes; Reports.jsx reordered into the spec's zone order with per-zone error states; charts rendered static.

**Tech Stack:** React Native, Expo Router, NativeWind, zustand (+persist 1h TTL), react-native-gifted-charts (static), Firebase RTDB modular SDK, jest + jest-expo.

**Out of scope (do not touch):** backend, dashboard, `fetchTodayTrend` whole-node read (dashboard path — known adjacent risk, separate task), victory-native/Skia uninstall (separate cleanup), EAS/channel config.

**Verify command (every code task):**

```powershell
node -e "const b=require('@babel/core'); try { b.transformFileSync('app/(tabs)/reports.jsx'); b.transformFileSync('components/reports/EnergyPredictionChart.jsx'); b.transformFileSync('services/firebaseUsageService.js'); console.log('OK'); } catch(e) { console.log('FAIL:', e.message.split('\n')[0]); process.exitCode=1; }"
```

Expected: `OK`.

---

### Task 0: Wire jest (test infra, one time)

**Files:**
- Create: `F:\Capstone\WisEnergy\jest.config.js`

No project test files exist yet; `package.json` has jest + jest-expo but no
config, and `@/` alias (babel maps `@` → repo root) needs mirroring.

- [ ] **Step 1: Create jest.config.js**

```js
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/services/__tests__/*.test.js"],
};
```

- [ ] **Step 2: Verify config loads (no tests yet, expect exit 0)**

Run: `npx jest --listTests --watchAll=false`
Expected: prints nothing (no test files yet), exit code 0.

- [ ] **Step 3: Commit**

```powershell
git add jest.config.js
git commit -m "Test infra: wire jest-expo with @ alias"
```

---

### Task 1: Bounded fetchTopAppliances (TDD)

**Files:**
- Create: `F:\Capstone\WisEnergy\services\__tests__\fetchTopAppliances.test.js`
- Modify: `F:\Capstone\WisEnergy\services\firebaseUsageService.js` (replace lines 157-189)

Background: current implementation does `get(ref(db, 'daily_summary/${userId}'))`
— the entire history node — on every Reports focus. New implementation reads
the tiny config roster `appliances/{userId}` (shape: `{deviceId: {appName:
{appliance_nickname, added_at}}}`), then per appliance a bounded
`query(..., orderByKey(), limitToLast(30))` over date keys `YYYY-MM-DD`
(lexicographic = chronological), summing `total_kWh`. 30 days × small nodes.

- [ ] **Step 1: Write the failing test**

```js
jest.mock("firebase/database", () => ({
  ref: jest.fn((db, path) => ({ __path: path })),
  query: jest.fn((r) => r),
  orderByKey: jest.fn(() => ({ __order: "key" })),
  limitToLast: jest.fn(() => ({ __limit: 30 })),
  get: jest.fn(),
}));
jest.mock("../../firebase/firebaseConfig", () => ({ db: {} }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));

const { get } = require("firebase/database");
const { fetchTopAppliances } = require("../firebaseUsageService");

const dateNode = (total) => ({
  child: (k) => ({ val: () => (k === "total_kWh" ? total : null) }),
});
const snapOf = (dateTotals) => ({
  exists: () => true,
  val: () => ({}),
  forEach: (cb) => {
    Object.entries(dateTotals).forEach(([date, total]) =>
      cb({ key: date, ...dateNode(total) })
    );
  },
});

test("sums only the last 30 days per appliance, sorted desc, bounded reads", async () => {
  const days = {};
  for (let i = 1; i <= 40; i++)
    days[`2026-01-${String(i).padStart(2, "0")}`] = 1;
  get.mockImplementation(async (r) => {
    if (r.__path === "appliances/u1")
      return { exists: () => true, val: () => ({ d1: { Fan: {}, Lamp: {} } }) };
    if (r.__path.includes("/Fan")) return snapOf(days);
    return snapOf({ "2026-01-40": 5 });
  });

  const res = await fetchTopAppliances("u1", 5);

  const paths = get.mock.calls.map((c) => c[0].__path);
  expect(paths[0]).toBe("appliances/u1");
  expect(paths.every((p) => p.startsWith("daily_summary/u1/"))).toBe(true);
  expect(paths.some((p) => p === "daily_summary/u1")).toBe(false);
  expect(res).toEqual([
    { name: "Fan", kwh: 30 },
    { name: "Lamp", kwh: 5 },
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest services/__tests__/fetchTopAppliances.test.js --watchAll=false`
Expected: FAIL (`fetchTopAppliances` sums all 40 days / reads whole node).

- [ ] **Step 3: Replace implementation (old lines 157-189)**

```js
export const fetchTopAppliances = async (userId, limit = 5) => {
  const month = new Date().toISOString().slice(0, 7);
  const key = `@top30:${userId}:${month}`;

  const cached = await AsyncStorage.getItem(key);
  if (cached) return JSON.parse(cached).data;

  const totals = {};
  const rosterSnap = await get(ref(db, `appliances/${userId}`));
  if (rosterSnap.exists()) {
    for (const [deviceId, apps] of Object.entries(rosterSnap.val())) {
      for (const appName of Object.keys(apps || {})) {
        await microtask();
        const q = query(
          ref(db, `daily_summary/${userId}/${deviceId}/${appName}`),
          orderByKey(),
          limitToLast(30)
        );
        const snap = await get(q);
        let sum = 0;
        snap.forEach((dateSnap) => {
          sum += Number(dateSnap.child("total_kWh").val() || 0);
        });
        if (sum > 0) totals[appName] = (totals[appName] || 0) + sum;
      }
    }
  }

  const arr = Object.entries(totals)
    .map(([name, kwh]) => ({
      name,
      kwh: Number(kwh.toFixed(2)),
    }))
    .sort((a, b) => b.kwh - a.kwh)
    .slice(0, limit);

  safeSetItem(key, JSON.stringify({ data: arr }));
  return arr;
};
```

`query`, `orderByKey`, `limitToLast` are already imported at the top of
`firebaseUsageService.js` (lines 1-9). Same return shape as before, so
`useUsageStore.fetchTopAppliances` and the page need zero changes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest services/__tests__/fetchTopAppliances.test.js --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add services/firebaseUsageService.js services/__tests__/fetchTopAppliances.test.js
git commit -m "Bounded fetchTopAppliances: 30-day window, roster-driven"
```

---

### Task 2: Dev read-size log on the hot readers

**Files:**
- Modify: `F:\Capstone\WisEnergy\services\firebaseUsageService.js`

Spec §1 requires proof that no reports read exceeds ~100KB. Add one helper,
wrap the four hottest readers. Helper goes directly after `safeSetItem`
(lines 24-28).

- [ ] **Step 1: Add the helper**

Old (lines 24-28):

```js
const safeSetItem = (key, value) => {
  setTimeout(() => {
    AsyncStorage.setItem(key, value);
  }, 0);
};
```

New (append after it):

```js
const safeSetItem = (key, value) => {
  setTimeout(() => {
    AsyncStorage.setItem(key, value);
  }, 0);
};

/* ---------------------------------------------------------
   🔥 Dev-only read-size log (spec: prove the 100KB bound)
--------------------------------------------------------- */
const logReadSize = (label, snapshot) => {
  if (!__DEV__) return;
  try {
    const bytes = JSON.stringify(snapshot.val()).length;
    console.log(`[read-size] ${label}: ${(bytes / 1024).toFixed(1)}KB`);
  } catch {}
};
```

- [ ] **Step 2: Instrument fetchDailyTotalConsumption** — old line 435-436:

```js
      const snap = await get(refP);
```

New:

```js
      const snap = await get(refP);
      logReadSize(`daily-total/${d}`, snap);
```

- [ ] **Step 3: Instrument fetchWeeklyTotalConsumption** — old line 483:

```js
    const snap1 = await get(ref1);
```

New:

```js
    const snap1 = await get(ref1);
    logReadSize(`weekly-total/${y}/${m}`, snap1);
```

- [ ] **Step 4: Instrument fetchMonthlyTotalConsumption** — old lines 553-554:

```js
  const refPath = ref(db, `monthly_total_consumption/${userId}/${y}`);
  const snap = await get(refPath);
```

New:

```js
  const refPath = ref(db, `monthly_total_consumption/${userId}/${y}`);
  const snap = await get(refPath);
  logReadSize(`monthly-total/${y}`, snap);
```

- [ ] **Step 5: Instrument new fetchTopAppliances** — old (inside Task 1 code):

```js
        const snap = await get(q);
```

New:

```js
        const snap = await get(q);
        logReadSize(`top30/${deviceId}/${appName}`, snap);
```

- [ ] **Step 6: Verify + commit**

Run: the Verify command from the plan header. Expected: `OK`.

```powershell
git add services/firebaseUsageService.js
git commit -m "Dev read-size logging on reports hot readers"
```

---

### Task 3: Cap prediction hangs at 8s (reports paths only)

**Files:**
- Modify: `F:\Capstone\WisEnergy\services\firebaseUsageService.js`

Background: axios timeout is 20s and the Render backend cold-starts; each
report fetch awaits predictions inline (3× `predict_totals`, plus
`predict_usage` per appliance per device). Wrap only the reports-side call
sites so dashboard behavior is untouched. A timed-out prediction yields
`null`, and every existing `Array.isArray(pred?.daily)` guard already maps
that to `barData2 = []` — actuals still paint.

- [ ] **Step 1: Add withTimeout helper (place directly before fetchDailyReport, old line 229-232)**

Old:

```js
/* ---------------------------------------------------------
   🔥 DAILY REPORT (per device per appliance)
--------------------------------------------------------- */
export const fetchDailyReport = async (userId, deviceId, appliances) => {
```

New:

```js
/* ---------------------------------------------------------
   🔥 Cap backend prediction wait (cold starts hang for 20s+)
--------------------------------------------------------- */
const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("predict-timeout")), ms)
    ),
  ]).catch(() => null);

/* ---------------------------------------------------------
   🔥 DAILY REPORT (per device per appliance)
--------------------------------------------------------- */
export const fetchDailyReport = async (userId, deviceId, appliances) => {
```

- [ ] **Step 2: fetchDailyReport predict call** — old lines 248-252:

```js
    const pred = await predictionServices.predict_usage(
      userId,
      deviceId,
      appliance.name
    );
```

New (fetchDailyReport only):

```js
    const pred = await withTimeout(
      predictionServices.predict_usage(userId, deviceId, appliance.name)
    );
```

- [ ] **Step 3: fetchWeeklyReport predict call** — old lines 347-351, same
shape:

```js
    const pred = await predictionServices.predict_usage(
      userId,
      deviceId,
      appliance.name
    );
```

New (fetchWeeklyReport only):

```js
    const pred = await withTimeout(
      predictionServices.predict_usage(userId, deviceId, appliance.name)
    );
```

- [ ] **Step 4: fetchMonthlyReport predict call** — old lines 399-403, same
shape. New (fetchMonthlyReport only):

```js
    const pred = await withTimeout(
      predictionServices.predict_usage(userId, deviceId, appliance.name)
    );
```

- [ ] **Step 5: fetchDailyTotalConsumption predict call** — old line 449:

```js
    const pred = await predictionServices.predict_totals(userId);
```

New (fetchDailyTotalConsumption only):

```js
    const pred = await withTimeout(predictionServices.predict_totals(userId));
```

- [ ] **Step 6: fetchWeeklyTotalConsumption predict call** — old line 525,
same one-liner. New (fetchWeeklyTotalConsumption only):

```js
    const pred = await withTimeout(predictionServices.predict_totals(userId));
```

- [ ] **Step 7: fetchMonthlyTotalConsumption predict call** — read the
function first (lines 551+, continues past line 614 region) and apply the
identical one-line wrap to its `predict_totals` call site.

- [ ] **Step 8: Re-run Task 1 test (no regressions) + Verify command**

Run: `npx jest services/__tests__/fetchTopAppliances.test.js --watchAll=false`
Expected: PASS. Then the header Verify command. Expected: `OK`.

- [ ] **Step 9: Commit**

```powershell
git add services/firebaseUsageService.js
git commit -m "Cap reports predictions at 8s (cold-start hangs)"
```

---

### Task 4: Reports.jsx zone order + per-zone errors

**Files:**
- Modify: `F:\Capstone\WisEnergy\app\(tabs)\reports.jsx`

Current order: heroes (359-404) → Savings (411-421) → pills (423-450) →
picker (452-499) → chart+list (501-667). Spec §2 order: controls (pills +
picker) → heroes → chart → list → savings → reset. Moves are cut/paste of
the exact blocks below; inner JSX byte-identical.

- [ ] **Step 1: Move pills + picker above the hero strip**

Cut the whole `{/* Category Filters */}` block (lines 423-450) and the whole
`{/* Device Picker */}` block (lines 452-499, ending right before the
`{/* ALL DEVICES VIEW */}` comment at line 501), and paste both — in that
order, pills then picker — directly after the subtitle at lines 356-357:

```jsx
        <Text className="text-xl font-bold text-green-800">Reports</Text>
        <Text className="text-sm text-gray-500 mb-4">Historical Usage & Insights</Text>

        {/* Category Filters */}
        ... (moved block, unchanged) ...

        {/* Device Picker */}
        ... (moved block, unchanged) ...

        {/* Hero strip */}
```

- [ ] **Step 2: Move Savings below the list**

Cut the `{/* Savings Over Time */}` title (lines 411-414) plus the
`<SavingsChart ... />` block (lines 416-421) and paste them directly after
the closing of the device-view conditional (after line 667 `)}`, before
line 668 `</ScrollView>`).

- [ ] **Step 3: Per-zone error state**

Old (line 69): `const [resetDialog, setResetDialog] = useState(null); // ...`

New (append after it):

```jsx
  const [zoneError, setZoneError] = useState({});
```

Old (section A `loadInitial`, lines 117-145): wrap the `Promise.allSettled`
so failures land per zone. Replace:

```js
      const loadInitial = async () => {
        try {
          await Promise.allSettled([
            fetchDailyTotals(uid),
            fetchWeeklyTotals(uid),
            fetchMonthlyTotals(uid),
            fetchAllBudget(uid),
            fetchTopAppliances(uid),
          ]);
```

with:

```jsx
      const loadInitial = async () => {
        try {
          const [d, w, m, b, t] = await Promise.allSettled([
            fetchDailyTotals(uid),
            fetchWeeklyTotals(uid),
            fetchMonthlyTotals(uid),
            fetchAllBudget(uid),
            fetchTopAppliances(uid),
          ]);
          if (!active) return;
          setZoneError({
            daily: d.status === "rejected" ? String(d.reason?.message || d.reason) : null,
            weekly: w.status === "rejected" ? String(w.reason?.message || w.reason) : null,
            monthly: m.status === "rejected" ? String(m.reason?.message || m.reason) : null,
            budget: b.status === "rejected" ? String(b.reason?.message || b.reason) : null,
            top: t.status === "rejected" ? String(t.reason?.message || t.reason) : null,
          });
```

(Keep the rest of `loadInitial` — the `if (!active) return;` right after
becomes redundant but harmless; leave it.)

- [ ] **Step 4: Inline zone retry UI (chart card header)**

Old (lines 511-515):

```jsx
              <View className="flex-row items-start justify-between mb-4">
                <View>
                  <Text className="text-base font-bold text-gray-800">{chartMeta.title}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{chartMeta.month}</Text>
                </View>
```

New (insert error line after the subtitle, inside the same parent):

```jsx
              <View className="flex-row items-start justify-between mb-4">
                <View>
                  <Text className="text-base font-bold text-gray-800">{chartMeta.title}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{chartMeta.month}</Text>
                  {zoneError[reportCategory.toLowerCase()] && (
                    <Text className="text-xs text-red-600 mt-1">
                      Couldn't refresh — showing cached data.
                    </Text>
                  )}
                </View>
```

- [ ] **Step 5: Memoize the savings inputs (currently rebuilt every render,
lines 303-310)**

Old:

```js
  const lineData1 = allMonthlyTotalConsumption.map((d) => ({
    ...d,
    type: "consumption",
  }));
  const lineData2 = allBudget.map((d) => ({
    ...d,
    type: "budget",
  }));
```

New:

```js
  const lineData1 = useMemo(
    () => allMonthlyTotalConsumption.map((d) => ({ ...d, type: "consumption" })),
    [allMonthlyTotalConsumption]
  );
  const lineData2 = useMemo(
    () => allBudget.map((d) => ({ ...d, type: "budget" })),
    [allBudget]
  );
```

- [ ] **Step 6: Verify + commit**

Run: the header Verify command. Expected: `OK`.

```powershell
git add "app/(tabs)/reports.jsx"
git commit -m "Reports zone order + per-zone errors + memoized savings inputs"
```

---

### Task 5: Static charts (drop animation)

**Files:**
- Modify: `F:\Capstone\WisEnergy\components\reports\EnergyPredictionChart.jsx`

Background: `isAnimated` replays 60+ SVG bar animations on every store
update; with the bounded data layer the spike is gone, but animation
re-mounts were part of the churn. Same look, no motion.

- [ ] **Step 1: Remove animation props**

Old:

```jsx
          showValuesAsTopLabel={showTopLabels}
          topLabelTextStyle={{ color: "#111827", fontSize: 10, fontWeight: "600" }}
          isAnimated
          animationDuration={400}
        />
```

New:

```jsx
          showValuesAsTopLabel={showTopLabels}
          topLabelTextStyle={{ color: "#111827", fontSize: 10, fontWeight: "600" }}
        />
```

- [ ] **Step 2: Check SavingsChart for the same props** — open
`F:\Capstone\WisEnergy\components\reports\SavingsChart.jsx`; if its chart
element carries `isAnimated` or `animationDuration`, remove those two props
only, inner JSX untouched.

- [ ] **Step 3: Verify + commit**

Run: the header Verify command. Expected: `OK`.

```powershell
git add components/reports/EnergyPredictionChart.jsx components/reports/SavingsChart.jsx
git commit -m "Static reports charts (drop bar animations)"
```

---

### Task 6: Soak verification + merge (no code)

**Files:** none. **Prerequisite:** Tasks 0–5 in the dev-client build
(rebuild locally: `gradlew.bat assembleDebug`, reinstall, connect to the
running dev server).

- [ ] **Step 1:** Fresh open → cached heroes paint instantly; Metro shows
`[read-size]` lines, every one under 100KB.
- [ ] **Step 2:** 10-minute soak: cycle Daily/Weekly/Monthly × (All Devices
+ one device), open/close the appliance modal twice, background + resume
the app once. No freeze, no silent close.
- [ ] **Step 3:** Airplane-mode check: cached numbers render with the
"updated X ago" stamp; chart zone shows its error line, page stays alive.
- [ ] **Step 4:** Record results as a reply (read-size lines + pass/fail per
step). Any failure → stop, file numbers, revise Tasks 1–5 first. Commit
nothing.
- [ ] **Step 5 (only after user confirms all-green):** push branch and open
the merge:

```powershell
git push origin reports-polish
```

then merge `reports-polish` → `master` (local merge or PR per owner choice).

---

## Self-Review

1. **Spec coverage:** §1 bounded reads → Tasks 1 (top-30 window), 2 (100KB
proof log); per-screen keyed reads already narrow (verified in current
code: daily/weekly/monthly report + totals readers); §2 zone order → Task
4 steps 1-2; cached-first + per-zone skeleton already shipped (kept);
§3 static charts → Task 5; memoization → Task 4 step 5 + existing memos;
§4 per-zone errors/empty/offline → Task 4 steps 3-4 (empty states already
exist: "No data yet…" / "No appliance usage data available."); §5 soak +
read-size proof → Task 6.
2. **Placeholder scan:** all code blocks complete; node paths
(`daily_summary/{uid}/{device}/{app}/{date}`, `total_kWh`,
`total_energy_consumption`, `appliances/{uid}` roster shape) verified
against service sources above; no TBD/TODO; no "similar to" shortcuts
(Step 7 of Task 3 names the exact function and call shape).
3. **Type consistency:** `withTimeout` defined once (Task 3 step 1),
consumed identically in steps 2-7; `logReadSize(label, snapshot)` defined
once (Task 2 step 1), same signature in steps 2-5; `zoneError` state +
setter defined once (Task 4 step 3), consumed in step 4;
`fetchTopAppliances` returns the same `[{name, kwh}]` shape the store and
hero memo already consume.
