/* Public firmware manifest (no auth). This is the source of truth for
   "update available" — the device polls the same file and installs the update
   itself, so the app only reports it. */
const MANIFEST_URL =
  "https://raw.githubusercontent.com/darinjan13/wisenergy-firmware/main/latest.json";

export const fetchLatestFirmware = async () => {
  try {
    // Query param busts the CDN/GitHub cache so a fresh publish is visible.
    const res = await fetch(`${MANIFEST_URL}?t=${Date.now()}`);
    if (!res.ok) return null;
    const j = await res.json();
    return j?.version ? j : null;
  } catch {
    return null;
  }
};
