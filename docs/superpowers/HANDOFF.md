# Session Handoff — WisEnergy (all repos)

Date: 2026-10-14. Context: capstone-238eb is LIVE (app+backend+chips pointed here).
wisenergy-11737 is legacy (data migrated off it; do not write there).

## Branch map (app repo F:\Capstone\WisEnergy)
- `master`: reports core (heroes/cached/FlatList/viewport), live watts, specs+plans.
- `reports-polish` (ACTIVE, 4 ahead): recalibrate button+waiting, card-menu recalibrate,
  Stitch reports chrome port. NOT merged — merge to master when stable.
- Firmware repo: `main`, all pushed. Backend repo: `main`, all pushed.

## Pending items (priority order)
1. **Heap crashes (ESP32):** CORRUPT HEAP asserts persist. Heap steady ~77k → overwriter
   (not leak). Decoder ready: `xtensa-esp32-elf-addr2line` + current `.elf` at
   `...\AppData\Local\arduino\sketches\EF880898D9E59FD0124471CA681CFC64\sketch_mar11a.ino.elf`.
   Need: fresh backtrace from current build. Mitigations shipped: single Firebase
   pumper, 15s WDT, heap-guard reboot <45KB, request batching, stream echo skip.
2. **Bench validation:** fan reads 50W/PF0.88 ✓ (V-sign fix proven). Remaining: monitor
   delta, loaded-PC delta, two-point `cali` + `phase` vs resistive load if available.
3. **OTA end-to-end:** CI trial tag `v1.1.0-rc1` result unknown; backend needs
   `GITHUB_FIRMWARE_TOKEN` env; first real tag→banner→tap→reboot cycle untested.
4. **Service-account key:** on-disk copy tested DEAD (likely already rotated — confirm
   in console IAM, delete old keys). Backend `FIREBASE_CREDS` env must hold a live key.
5. **Rates:** Sept fixed (1.4408→15.9806, After-VAT prompt + range guard shipped).
   Audit older months vs MECO site. VECO path still guesses from training data — needs
   real scrape or an unreliable flag.
6. **Janitor:** scheduled 01:30, first-run log line unchecked. Confirm `Janitor: deleted N`.
7. **Notifications:** needs fresh-APK install (capstone google-services) + token check
   + test curl. See prior session notes for the exact curl.
8. **Firestore audit:** backend inits Firestore client; contents never mapped/migrated.
9. **Password:** user must reset `darinjan13@gmail.com` via email flow on capstone.
10. **Fresh preview APK** (channel-pinned build) — install + restart twice for OTA chain.

## Key facts (do not re-derive)
- Device d8bc24124b00, owner uid `tVD45VkzSUhwDwpa3yRES71Wxar2`, room mode,
  appliance `WholeRoom` (spaceless canonical; display keeps "Whole room").
- Sensor truth: ZMPT output INVERTED (V negated in code); ACS normal polarity.
  Vrms ~214V ✓. HLK-5M05 supply, star-grounded, 5V modules (clips >8A peaks).
- Cal: NVS + Firebase `/devices/<id>/cal` mirror; vSens≈158-162 stable; iSens default
  0.100 until two-point cali; phase default 1. `calclear` only with mains on.
- Upload cadence 1Hz (power>0 only), live PATCH every 3rd tick, heartbeat 30s,
  zero-gate 0.10A, low-conf 0.09A, 65→100V no-mains gate (PH 220V).
- App channel `preview`, runtime 1.0.0; CLI publish via stored EXPO_TOKEN
  (machine env). EAS minutes: workflows deleted, CLI costs zero.
- Stitch refs: `docs/superpowers/refs/` (reports.html/png = current port source,
  dashboard-adapted.html = adapted preview). Reports spec+plan in
  `docs/superpowers/{specs,plans}/2026-10-13-reports-*`.
- New session needs: stitch MCP tools ARE available there (config done) — this
  session drove it via manual curl instead.
