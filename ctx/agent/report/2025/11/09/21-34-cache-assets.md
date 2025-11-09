# Update static cache list

## Goal
Align `web/service-worker.js` with the actual asset tree by removing non-existent entries from `STATIC_ASSETS` so the install step succeeds.

## Actions
- removed `rtc/peer.js` and `ws/client.js` from the static asset list because those paths are absent in the repository.

## Results
- `web/service-worker.js` no longer attempts to cache missing files, preventing install-time failures when populating the core cache.
