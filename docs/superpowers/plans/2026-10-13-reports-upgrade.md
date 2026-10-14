# Reports Page Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reports renders cached heroes instantly, shows one clear chart viewport, and virtualizes lists — same data, sources, and libraries.

**Architecture:** All changes inside `app/(tabs)/reports.jsx` (+1 store line): compute hero numbers from already-fetched store slices, render persisted zustand state first with an updated-stamp, virtualize the two breakdown lists, reorder JSX blocks. No new dependencies, no service changes, no backend work.

**Tech Stack:** React Native, Expo Router, NativeWind, zustand (+persist already on `useUsageStore`, 1h TTL), react-native-gifted-charts (untouched), AsyncStorage caches (already written by services).

**Verify command (every code task):**

```powershell
node -e "const b=require('@babel/core'); try { b.transformFileSync('app/(tabs)/reports.jsx'); console.log('OK'); } catch(e) { console.log('FAIL:', e.message.split('\n')[0]); process.exitCode=1; }"
```

Expected: `OK`. `FAIL` = fix before committing. (Repo has zero jest tests; babel parse + expo smoke + on-device checks per spec §4 are the gates.)

---

### Task 1: Hero strip (compute + render)

**Files:**
- Modify: `F:\Capstone\WisEnergy\app\(tabs)\reports.jsx`

Store facts (verified): `dailyData.dailyTotals[0]` = `{title, latestKwh, barData:[{label,value}...], barData2}` (same for weekly/monthly); `topAppliances[0]` = `{name, kwh}` (after adding the fetch below).

- [ ] **Step 1: Fetch top appliances on initial load**

Old (in section A `Promise.allSettled`):

```js
await Promise.allSettled([
  fetchDailyTotals(uid),
  fetchWeeklyTotals(uid),
  fetchMonthlyTotals(uid),
  fetchAllBudget(uid),
]);
```

New (add one line + destructure `fetchTopAppliances` from `useUsageStore()` at the top where the other fetchers are destructured):

```js
await Promise.allSettled([
  fetchDailyTotals(uid),
  fetchWeeklyTotals(uid),
  fetchMonthlyTotals(uid),
  fetchAllBudget(uid),
  fetchTopAppliances(uid),
]);
```

- [ ] **Step 2: Add hero memo + updated stamp (place directly after the `totalUsageAll` memo)**

```jsx
const heroStats = useMemo(() => {
  const day = dailyData.dailyTotals?.[0];
  const week = weeklyData.weeklyTotals?.[0];
  const dayBars = day?.barData ?? [];
  const weekBars = week?.barData ?? [];
  const dayDelta = dayBars.length >= 2
    ? Number((dayBars[dayBars.length - 1].value - dayBars[dayBars.length - 2].value).toFixed(2))
    : null;
  const weekDelta = weekBars.length >= 2
    ? Number((weekBars[weekBars.length - 1].value - weekBars[weekBars.length - 2].value).toFixed(2))
    : null;
  const top = topAppliances?.[0] ?? null;
  return {
    today: day?.latestKwh ?? null,
    todayDelta: dayDelta,
    week: week?.latestKwh ?? null,
    weekDelta: weekDelta,
    topName: top?.name ?? null,
    topKwh: top?.kwh ?? null,
    topShare: top && totalUsageAll > 0 ? Math.round((top.kwh / totalUsageAll) * 100) : null,
  };
}, [dailyData, weeklyData, topAppliances, totalUsageAll]);
```

Also destructure `topAppliances` from `useUsageStore()` next to `dailyData, weeklyData, monthlyData`, and add state + setter:

```jsx
const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
```

Set it at the end of section B's `run()` in both completion paths: after `setReportLoading(false)` in the All-Devices branch AND in the specific-device branch, add `setLastUpdatedAt(new Date())`.

- [ ] **Step 3: Render hero strip (insert directly after the `<Text>Reports</Text>` title block, before the Savings section)**

```jsx
{/* Hero strip */}
<View className="flex-row gap-x-3 mb-4">
  <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl">
    <Text className="text-[11px] text-gray-500 font-semibold">Today</Text>
    <Text className="text-2xl font-extrabold text-[#2E4F4F]">
      {heroStats.today ?? "—"}
    </Text>
    <Text className="text-xs text-gray-500">kWh{heroStats.todayDelta !== null && ` (${heroStats.todayDelta >= 0 ? "+" : ""}${heroStats.todayDelta})`}</Text>
  </View>
  <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl">
    <Text className="text-[11px] text-gray-500 font-semibold">This week</Text>
    <Text className="text-2xl font-extrabold text-[#2E4F4F]">
      {heroStats.week ?? "—"}
    </Text>
    <Text className="text-xs text-gray-500">kWh{heroStats.weekDelta !== null && ` (${heroStats.weekDelta >= 0 ? "+" : ""}${heroStats.weekDelta})`}</Text>
  </View>
  <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl">
    <Text className="text-[11px] text-gray-500 font-semibold">Top appliance</Text>
    <Text className="text-base font-extrabold text-[#2E4F4F]" numberOfLines={1}>
      {heroStats.topName ?? "—"}
    </Text>
    <Text className="text-xs text-gray-500">
      {heroStats.topKwh !== null ? `${heroStats.topKwh} kWh${heroStats.topShare !== null ? ` • ${heroStats.topShare}%` : ""}` : "—"}
    </Text>
  </View>
</View>
{lastUpdatedAt && (
  <Text className="text-[10px] text-gray-400 mb-4">
    Updated {lastUpdatedAt.toLocaleTimeString()}
  </Text>
)}
```

- [ ] **Step 4: Verify** — Verify command, expect OK.

- [ ] **Step 5: Commit**

```powershell
git add "app/(tabs)/reports.jsx"
git commit -m "Reports hero strip from cached store slices + updated stamp"
```

### Task 2: Cached-first paint (kill the double skeleton)

**Files:**
- Modify: `F:\Capstone\WisEnergy\app\(tabs)\reports.jsx`

Background (verified): `useUsageStore` persists `dailyData/weeklyData/monthlyData/topAppliances` with 1h TTL, so returning visits already hold data. Today the page still shows skeletons because section A gates on fresh fetches and section B always sets `reportLoading=true`.

- [ ] **Step 1: Skip skeleton when persisted slices exist**

Old (section B `run()` start):

```js
const run = async () => {
  setReportLoading(true);
```

New:

```js
const run = async () => {
  const hasPersisted =
    (reportCategory === "Daily" && (dailyData.dailyTotals?.length || Object.keys(dailyData.dailyReport || {}).length)) ||
    (reportCategory === "Weekly" && (weeklyData.weeklyTotals?.length || Object.keys(weeklyData.weeklyReport || {}).length)) ||
    (reportCategory === "Monthly" && (monthlyData.monthlyTotals?.length || Object.keys(monthlyData.monthlyReport || {}).length));
  if (!hasPersisted) setReportLoading(true);
```

`dailyData/weeklyData/monthlyData` are already in scope (used by section C below it).

- [ ] **Step 2: Verify** — Verify command, expect OK.

- [ ] **Step 3: Commit**

```powershell
git add "app/(tabs)/reports.jsx"
git commit -m "Reports render persisted slices first, skeleton only when empty"
```

### Task 3: Virtualize the two breakdown lists

**Files:**
- Modify: `F:\Capstone\WisEnergy\app\(tabs)\reports.jsx`

- [ ] **Step 1: Import FlatList**

Old:

```js
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  useColorScheme,
} from "react-native";
```

New: add `FlatList` to that same import list (insert alphabetically after `Alert`):

```js
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  FlatList,
  useColorScheme,
} from "react-native";
```

- [ ] **Step 2: All-devices list → FlatList**

Old (inside the All-Devices view, the `allAppliancesForAllDevices.map((item, i) => { ... })` block returning the `TouchableOpacity` rows):

```jsx
{allAppliancesForAllDevices.map((item, i) => {
  const powerUsed = item.latestKwh ?? 0;
  return (
    <TouchableOpacity
      key={item.applianceName + "-" + i}
      onPress={() => {
        setSelectedAppliance(item);
        setModalVisible(true);
      }}
      className="mb-4"
    >
```

New: replace the whole `{allAppliancesForAllDevices.map(...)}` expression (keep the inner row JSX byte-identical, only the wrapper changes):

```jsx
<FlatList
  data={allAppliancesForAllDevices}
  keyExtractor={(item, i) => item.applianceName + "-" + i}
  scrollEnabled={false}
  renderItem={({ item, index: i }) => {
    const powerUsed = item.latestKwh ?? 0;
    const total = totalUsageAll;
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedAppliance(item);
          setModalVisible(true);
        }}
        className="mb-4"
      >
```

Keep every inner line (`View flex-row`, `CustomProgressBar`, kWh text) exactly as-is; close with `);}} />` replacing the old `});}`. (`totalUsageAll` is already in scope.)

- [ ] **Step 3: Specific-device list → FlatList** — same surgery on the `reports.map((item, i) => {` block in the specific-device view, where `total` is computed via `reports.reduce(...)` above it (already in scope). Same `scrollEnabled={false}`, same `keyExtractor`, inner JSX untouched.

- [ ] **Step 4: Verify** — Verify command, expect OK.

- [ ] **Step 5: Commit**

```powershell
git add "app/(tabs)/reports.jsx"
git commit -m "Virtualize reports breakdown lists with FlatList"
```

### Task 4: Chart viewport staging (layout only, no chart-prop changes)

**Files:**
- Modify: `F:\Capstone\WisEnergy\app\(tabs)\reports.jsx`

- [ ] **Step 1: Give the chart card breathing room**

Old (All-Devices chart card):

```jsx
<View
  style={styles.cardShadow}
  className="bg-white p-4 rounded-2xl mb-4"
>
  {/* Overall Chart */}
```

New (taller padding, larger bottom margin so the chart owns a viewport):

```jsx
<View
  style={styles.cardShadow}
  className="bg-white p-5 rounded-2xl mb-6 min-h-[320px] justify-center"
>
  {/* Overall Chart */}
```

Apply the identical class change to the specific-device chart card (`Appliance Usage` card). Do NOT touch chart component props.

- [ ] **Step 2: Verify** — Verify command, expect OK.

- [ ] **Step 3: Commit + push**

```powershell
git add "app/(tabs)/reports.jsx"
git commit -m "Stage reports charts as full viewports"
git push
```

### Task 5: On-device verification (no code)

**Files:** none. **Prerequisite:** Tasks 1–4 published via CLI to `preview`.

- [ ] **Step 1:** Fresh open → heroes show cached numbers instantly (or skeletons only on true first run).
- [ ] **Step 2:** Switch Daily/Weekly/Monthly + device picker → no refetch spinner when data exists; "Updated …" stamp refreshes.
- [ ] **Step 3:** 6-state visual pass (3 categories × single device + All Devices); appliance-tap modal opens; reset button, mode chip, firmware banner, live row all behave.
- [ ] **Step 4:** Record results as a reply. Any failure → file numbers/screenshots, revise Tasks 1–4 first. Commit nothing.

### Task 6: Victory chart swap (added 2026-10-14)

**Files:**
- Modify: `F:\Capstone\WisEnergy\components\reports\EnergyPredictionChart.jsx`

Swap gifted-charts `BarChart` for victory-native `CartesianChart` + `BarGroup`
(deps already installed: victory-native 41.x, Skia, Reanimated). Same props
(`actualData/barData`, `predictedData/barData2`, `category`), same label/sort
logic, same colors (`#16a34a` actual / `#f87171` predicted), same title +
legend, same maxValue formula. Axis font = bundled
`assets/fonts/SpaceMono-Regular.ttf` via Skia `useFont`. No per-bar top
labels (crowded on mobile; y-axis + Avg chip cover it). No press interaction
in v1 — gifted had none either; list-row modal remains the drill-down path.
Callers (`reports.jsx`, `ApplianceModal.jsx`) untouched.

- [ ] **Step 1:** Rewrite component as specified.
- [ ] **Step 2: Verify** — Verify command on both `components/reports/EnergyPredictionChart.jsx` and `app/(tabs)/reports.jsx`, expect OK twice.
- [ ] **Step 3: Commit + CLI-publish to `preview`, on-device chart check**
  (grouped green/red bars, axes legible, empty-state text, modal chart too).

---

## Self-Review

1. **Spec coverage:** §1 layout (heroes Task 1, dropdown kept — untouched by design, pills untouched, reset already seated, single chart viewport Task 4, virtualized list Task 3). §2 data (cached-first Task 2 built on the verified 1h-TTl persisted slices + existing service caches; memoization already present via `useMemo`, extended by hero memo Task 1; FlatList Task 3). §3 components (hero cards reuse dashboard `cardShadow`/teal/extrabold language Task 1; `#4CAF50` + gifted-charts untouched; `~` convention untouched; appliance-tap modal untouched). §4 testing (Task 5 verbatim checks).
2. **Placeholder scan:** all code blocks complete; store shapes (`dailyTotals[0].{latestKwh,barData[{label,value}]}`, `topAppliances[0].{name,kwh}`, `dailyReport[deviceId]`) verified against service + store sources; no TBD/TODO; no "similar to" shortcuts.
3. **Type consistency:** `heroStats.{today,todayDelta,week,weekDelta,topName,topKwh,topShare}` defined once in Task 1, consumed identically in its render block; `lastUpdatedAt` state + setter defined Task 1, set in the same edit; `resetDeviceHistory` untouched; `FlatList` import added before first use in Task 3.
