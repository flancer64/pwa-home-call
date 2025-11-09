# PWA service worker sync

## Goal

Ensure the service worker caches the full PWA surface described in `ctx/rules/web/pwa.md` and enforces the required fetch strategies.

## Actions

- listed every frontend module under `web/app/` plus the shared static assets into the core cache.
- updated the install/activate hooks to populate the versioned `homecall-v{version}` cache and trim stale versions.
- rewrote fetch handling so `version.json` is always network-fetched, navigations become network-first with an `index.html` fallback, and core assets use cache-first semantics while other requests go straight to the network.

## Results

- `web/service-worker.js` now fulfills the PWA directive (full offline DI startup, versioned cache, appropriate fetch policies).
- Existing reports or instructions remain untouched, ready for the next iteration.
