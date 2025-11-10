# Sync PWA version behavior

- **Goal:** Confirm that the automatic update, cache clearing, and logging flows described in `ctx/rules/web/pwa.md` sections 3‑5 actually run as declared for HomeCall Web PWA.
- **Actions:** Reviewed `web/app/Core/VersionWatcher.mjs`, `web/service-worker.js`, `web/app/Pwa/CacheCleaner.mjs`, and toolbar bindings for alignment with the declarative spec; enhanced `VersionWatcher` to force a service worker update when `version.json` changes and to notify any waiting/soon-to-be-waiting worker with the `"skip-waiting"` signal; added the mandated `info` log (`"PWA cache cleared and service worker reinstalled"`) inside `CacheCleaner.clear()` before triggering the reload; confirmed there are no `toolbar-refresh` artifacts in the UI.
- **Results:** Version checks now prompt the service worker to refresh caches and activate immediately when the version file diverges; manual cache clearing still removes all caches, unregisters workers, reloads the page, and now records the required info-level entry via the injected logger; the toolbar exposes only the clear-cache button per the documentation.
- **Version:** Updated `web/version.json` → `20251110-212106`.
- **Testing:** `node --test test/web/app/Pwa/CacheCleaner.test.mjs`
- **Commit:** pending (not yet created)
