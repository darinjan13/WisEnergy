# Reports Page Upgrade Design

Date: 2026-10-13 | Status: approved, pending implementation plan

## Goal

Make Reports faster and clearer with zero new data sources, zero new
dependencies (OTA-deliverable), and the device dropdown kept (scales to
many devices; chips don't).

## §1 — Layout (approved)

Same data, new hierarchy in `app/(tabs)/reports.jsx`:
- Hero strip first: three cards (Today kWh + vs-yesterday delta, This week
  kWh + vs-last-week, Top appliance + share %), computed from already-fetched
  `dailyData`, `weeklyData`, and top-appliance totals.
- Controls unchanged in kind: existing device dropdown (kept deliberately),
  Daily|Weekly|Monthly pills, reset-data button re-seated under the picker.
- One full-width chart viewport per category (existing gifted-charts data
  props, appliance-tap modal preserved).
- Appliance breakdown list below, virtualized (`FlatList`), same row anatomy
  as device cards (name + bar + kWh).

## §2 — Data: cached-first, then fresh (approved)

- First paint from existing AsyncStorage caches (`@todayTrend`,
  `@overall_top_appliances`, per-report keys); skeletons only on true first
  run with empty cache.
- Background refetch swaps data in with an "Updated just now" stamp, never
  a skeleton flash.
- Memoized derived arrays (chart data, totals, top lists); `FlatList`
  virtualization for the breakdown.

## §3 — Components (approved)

- Heroes reuse dashboard card language (white `rounded-2xl` + `cardShadow`,
  extrabold numerals, green-down/red-up delta convention).
- Shared pill pattern for categories; red-outline style kept for reset.
- Chart keeps gifted-charts, bigger stage, report green `#4CAF50`.
- `~` low-confidence convention and appliance-tap modal preserved.

## §4 — Testing + rollout (approved)

- Visual: 3 categories × (single device + All Devices), empty-cache vs
  cached, side-by-side old vs new.
- Performance: cached heroes <300ms first paint on mid-range Android;
  tab switches with zero refetch.
- Regression smoke: appliance modal, device reset, mode chip, firmware banner,
  live row (untouched code paths in shared files).
- Rollout: single commit, CLI publish to `preview`, on-device verify.
