# App root alignment report

## Goal
- relocate the core app/utility modules from `web/app/app/` to `web/app/` so their paths match the expected root-level namespace.

## Actions
- moved `App.mjs`, `Logger.mjs`, and `VersionWatcher.mjs` up one directory to `web/app/` and removed the empty `app/` folder.
- updated the service worker's module manifest and the global typedef file to reflect the new paths.
- reran `npm run test:unit` to confirm no regressions; the suite still fails in `test/unit/Back/Service/Signal/Server.test.mjs`, consistent with the previous iteration.

## Results
- the DI resolver can now load `HomeCall_Web_App$`, `HomeCall_Web_VersionWatcher$`, and `HomeCall_Web_Logger$` directly from the project root without navigating a redundant subdirectory.
- the only remaining unit failure is the pre-existing `Signal/Server` test.
