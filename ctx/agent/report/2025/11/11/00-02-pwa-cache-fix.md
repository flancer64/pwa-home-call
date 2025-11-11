# PWA Cache Fix

## Changed files
- `web/service-worker.js`
- `ctx/rules/web/pwa.md`

## Description
- The service worker now fetches the version only once during `install`, stores it in `CURRENT_VERSION`, uses `homecall-v{CURRENT_VERSION}` for the core cache, and removes other caches before calling `clients.claim()`.
- The PWA rules document clarifies that activation reuses the stored version and no longer re-requests `version.json`.

## Logs after update
```
[VersionWatcher] Version change detected: 20251110-233000 → 20251111-000200
[ServiceWorker] Activated version 20251111-000200, old caches removed
```

## Cache verification
- Cache Storage now contains only `homecall-v20251111-000200`; older `homecall-v*` entries are deleted during activation, so manual cache clearing followed by reload continues to produce a single cache for the current version.
