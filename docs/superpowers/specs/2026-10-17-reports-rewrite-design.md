# Reports Page Rewrite Design

Date: 2026-10-17 | Status: approved by owner | Approach: A (query-narrow)

## Goal

Rewrite the Reports page end-to-end (data layer + hierarchy) because the
current page kills the app: visiting it triggers whole-history downloads
that spike memory until Android silently terminates the app. Same feature
set, new bones. No crash, no data loss, OTA-shippable.

## Root cause (verified before design)

- `fetchTodayTrend`, `fetchTopAppliances`, and sibling readers call
  `get()` on entire parent nodes (e.g. `daily_summary/{uid}` = every
  device × every appliance × every day × hourly), then traverse all of it
  in JS to display one day.
- Only one query in the usage service carries any limit.
- Each visit/category switch re-runs the avalanche and re-mounts two
  animated SVG charts. Memory peaks → LMK kill, no error. Matches the
  reported symptom exactly (fine for a while, then silent close).
- Listeners/timers ruled out: store has no `on()`/`setInterval`; DeviceCard
  listeners all clean up correctly.

## §1 — Data layer

- New narrow readers (extend `services/firebaseUsageService.js`, no new
  deps): day view reads day keys only; week reads 7 keys; month reads ~31
  keys via parallel keyed `get()`s. Each returns a few numbers.
- Hard rules: no `get()` above a node holding more than one day of data;
  every list query carries `limitToLast`; history beyond 90 days sits
  behind explicit "load more".
- Caching: existing AsyncStorage caches stay, re-keyed by day+device,
  stale-while-revalidate with an "updated X ago" stamp.
- Dev-only read-size log: every reports fetch logs its byte size in
  `__DEV__`; budget is 100KB per read. Proves the bound instead of hoping.

## §2 — Page structure (same features, fixed order)

Top to bottom, one screen:
1. Period segmented control (Today | Week | Month) + device picker.
2. Three hero numbers (period total + delta, comparison total + delta,
   top appliance + share).
3. ONE usage chart viewport (actual vs predicted for the selected period).
4. Appliance split list, virtualized, tap → detail modal (unchanged flow).
5. Savings-vs-budget card.
6. Per-device reset tucked under the picker (unchanged flow).

One chart viewport at a time. Skeleton per zone, never whole-tree.
Cached numbers paint first; fresh data swaps in without a flash.

## §3 — Rendering rules

- No animated charts above 12 bars (animation re-mounts were part of the
  memory churn). Static bars, identical look.
- Derived arrays memoized with stable refs; charts must not re-mount on
  unrelated store updates.
- Breakdown lists stay virtualized (`FlatList`, `scrollEnabled={false}`
  inside the page scroll).

## §4 — States

- Each zone fails independently with inline retry; one bad fetch never
  blanks the page.
- Empty state per zone ("No data yet…").
- Offline: serve cache stamped "updated X ago"; live-only elements hidden.

## §5 — Verification

- Before/after on the same account/data: current page dies, new page
  survives a 10-minute soak across all categories × All Devices + one
  device, Metro log clean.
- Dev read-size log shows every fetch under budget during the soak.
- Regression: appliance modal, reset flow, picker, budget save paths.

## Non-goals

- No backend changes. No new dependencies (OTA-safe). No chart library
  swap (gifted-charts stays; victory-native + Skia removal is a separate
  cleanup commit). Dashboard and other tabs untouched.
