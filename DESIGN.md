# WisEnergy — Design System for UI Regeneration

> Purpose: single source of truth for recreating this app's UI (e.g. in Stitch).
> Rules: keep every color token below exactly. Light theme only. No new
> data concepts — same screens, better hierarchy. Thumb-friendly (44px targets).

## 0. Product Context (read first — generators get this wrong)

WisEnergy monitors **room-level electricity in Philippine homes** with
ESP32 hardware (voltage + current sensors, relay). There is **no solar,
no battery, no EV charger, no grid export, no dollar pricing** — omitting
inventions matters more than adding features. Typical loads: electric fan
(~60W), monitor (~25W), desktop PC via UPS. Currency is **Philippine pesos
(₱)**, rates are per-kWh utility rates (e.g. ₱9–12/kWh). Tone: practical
utility app, not fintech, not eco-luxury. If a widget needs hardware the
user doesn't own (solar/battery/EV), it does not belong on screen.

## 1. Brand & Color Tokens

| Token | Hex | Usage |
|---|---|---|
| Primary / buttons / spinners / screen titles | `#166534` (green-800) | Primary buttons, headers, activity indicators, onboarding background |
| Accent green | `#16a34a` | Gradients (with #166534), success icons, toggles-on track `#10B981`, thumb `#065f46` |
| Link green | `#15803d` | Inline links |
| Heading teal | `#2E4F4F` | Card titles, device names, modal titles |
| Deep teal | `#23403A` | Section headings, settings icons, about pages |
| Back-arrow green | `#095333` | All back chevrons (size 28–30) |
| Emerald | `#047857` | Occasional emphasis text |
| Chart green | `#4CAF50` | Bars, progress fills |
| Success | `#22c55e` | Success states, check icons `#16A34A` |
| Warning yellow | `#facc15` | Alerts, notification icons |
| Danger red | `#ef4444` / `#DC2626` / `#dc2626` | Errors, destructive buttons (`bg-red-600`), delete text |
| Muted red button | `#BE4949` | Secondary destructive (delete-account flow) |
| Orange | `#f97316` / `#fb923c` | Energy/flash accents, mid efficiency |
| Gold | `#FDE047` / `#FBBF24` | Premium gems, highlights |
| Pale green fills | `#BBF7D0` / `#86efac` | Success badges, pale chart segments |
| Neutrals | `#e5e7eb` (track), `#d1d5db` (borders) | Chart backs, dividers |
| Secondary text/icons | `#6B7280` | Secondary text, chevrons, eye icons |
| Placeholders | `#9CA3AF` | Input placeholders, disabled icons |
| Input fill | `#F9F9F9` | Text inputs (`border-gray-300 rounded-md p-4/p-6`) |
| Page background | gray-100 (`#F3F4F6`-ish) | All tab screens |
| Cards | white | See §3 |

Status chips: Online = `bg-green-50` + `text-green-700` + green dot; Offline = `bg-gray-100` + gray text; mode chip = `bg-blue-50` + `text-blue-700`; amber update banner = `bg-amber-50 border-amber-200 text-amber-800`; destructive confirm buttons `bg-red-600` white text.

## 2. Typography

- Screen titles: `text-2xl font-bold`, green-800 (`#166534`) or heading teal.
- Card titles: `font-extrabold text-base`, `#2E4F4F`, single line.
- Hero numerals: extrabold, dark-green, largest on screen; tiny caption beneath (delta green `#16a34a` down-good / red `#dc2626` up-bad, gray otherwise).
- Body/labels: `text-xs`–`text-sm`, `text-gray-600`; micro labels `text-[10px]–text-[11px] text-gray-500`.
- Buttons: `text-xs–sm font-bold/semibold`, white on color, gray-700 on light.

## 3. Components (reuse, don't reinvent)

- **Card:** white, `rounded-2xl p-4/p-5 mb-4`, soft shadow (`cardShadow`: black 20% opacity, radius 6, elevation 10).
- **Pills:** `rounded-full`, selected = filled dark-green white text, unselected = white with gray border.
- **Primary button:** `bg-green-700` (or `#166534`) rounded-lg/xl, white bold text.
- **Icon buttons:** 40–48px circles (`w-10 h-10` / `w-12 h-12 rounded-full`); power toggle green-700 on / gray-200 off.
- **Overflow menu:** `⋮` opens a floating white panel (`rounded-xl border-gray-200 shadow-lg`, ~w-52): rows Edit / Delete(red) / MONITORS radio group (●/○) / Reset data…(red). Dimmed backdrop, tap-outside dismisses.
- **Modals:** `Modal` + dark `BlurView`, white `rounded-xl p-6 w-10/12`: confirm (Cancel gray + red action) and result (big status icon: green check / red alert, centered title, message lines, single OK).
- **Toasts:** success/error top notifications for saves, adds, clears.
- **Toggles:** platform Switch, green track when on.
- **Tab bar:** bottom, 4 tabs — Home, Devices (center, highlighted green when active), Reports, Budget.
- **Header:** logo + "WisEnergy" wordmark left, bell + avatar right.
- **Charts:** bars green `#4CAF50` rounded tops, value labels above, light gridlines, one chart per viewport; progress bars thin with proportional fill.

## 4. Screens (rebuild all of these)

1. **Onboarding** (5 swipe pages, green `#166534` full-bleed) → **Auth**: login, register, forgot-password flow. White cards on green, green primary buttons.
2. **Dashboard (Home):** greeting header ("Welcome Back, {name}!"), hero strip (Today kWh + delta, week kWh, top appliance), efficiency ring (green→yellow→orange→red scale), savings chart, AI insight cards.
3. **Devices list:** white device cards — nickname (extrabold teal), ID + paired-date (xs gray), Online/Offline chip, mode chip (blue), live `V / A` row, relay power button right, ⋮ menu top-right. Tapping an *appliance-mode* card opens its detail; *room-mode* cards are terminal (everything inline).
4. **Device detail (appliance-mode):** back chevron, device name/ID/status, appliance radio list (`ApplianceCard` rows with live watts + kWh), add (+) button, edit/delete via confirm modal, red-outline "Clear today's test data" button.
5. **Reports:** title → hero strip (Today / This Week / Top Appliance cards with deltas) → device **dropdown** (NOT chips — users own many devices) → Daily|Weekly|Monthly pills → ONE full-width bar chart → appliance breakdown rows (name + bar + kWh). Plus a red-outline "Reset device data" button under the picker (specific device selected only).
6. **Budget:** monthly budget card, spend-vs-budget progress, rate display (₱/kWh from city rates).
7. **Notifications:** icon-coded rows (yellow alert, red high-usage, green tips, orange energy, gray system).
8. **Settings cluster:** Profile (avatar initials, premium gradient card `#166534→#16a34a`, account rows, notification switches, Data Management card with 3 red wipe rows, Log Out), Edit Profile, Change Password, Delete Account, Subscription (premium plans), About/Terms/Privacy/Help.

## 5. UX Rules

- Destructive actions always confirm first (modal), then report success/partial/failure (result modal names refused paths).
- Never fake precision: low-confidence readings render with "~".
- Stale data shows age ("live 12s ago"), never pretends live.
- Empty states say so explicitly ("No data yet…", "No appliance usage data available").
- Optimistic UI on toggles/radios (instant flip, silent reconcile, snap back on failure).
- Snackbars/toasts confirm every save/add/clear.
