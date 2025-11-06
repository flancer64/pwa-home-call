# Iteration Report — Permissions UX Flow

## Goal

Enhance the first-run media permission experience in HomeCall PWA so users explicitly enable devices and receive clear guidance after denying access.

## Changes

- Deferred automatic media capture in `web/app.js`, added contextual status messaging, toast notifications, permission-state handling, and manual triggers for `prepareMedia()`.
- Updated `web/ui/enter.html`, `web/ui/call.html`, and shared styles to introduce the new guidance block, prepare/retry buttons, and alert/toast visuals.
- Added `test/unit/Web/PrepareMedia.test.mjs` with mocked media/permission scenarios and adjusted `npm run test:unit` to execute all `.mjs` specs.

## Tests

- `npm run test:unit` *(fails at `test/unit/Back/Service/Signal/Server.test.mjs` — blocked from binding a local port in the sandbox; remaining suites pass)*
- `node --test test/unit/Web/PrepareMedia.test.mjs`

## Notes

- Backend signaling server test should be rerun in an environment where TCP listeners are permitted to confirm full suite success.
