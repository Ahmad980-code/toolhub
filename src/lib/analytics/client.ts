/** Fire-and-forget event to /api/track (client only). Never throws. */
export function track(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    // text/plain keeps sendBeacon a "simple" request in every browser; the server parses the JSON.
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain;charset=UTF-8" }))) return;
    fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    // Tracking must never affect the page.
  }
}
