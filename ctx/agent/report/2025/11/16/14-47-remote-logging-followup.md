# Remote logging follow-up

## Goal
- Align the front-end settings card and shared configuration with the DI immutability rules from `ctx/rules/arch/teqfw.md` while keeping the remote logging toggle prioritized in the UI.

## Actions
- Reworked `HomeCall_Web_Config_RemoteLogging$` to keep mutable state outside the frozen instance via `WeakMap`, ensuring `setRemoteLoggingEnabled` no longer mutates read-only properties and following the TeqFW immutability guideline.
- Swapped the order of the settings buttons so the toggle appears before «Переустановить приложение», removed the `danger` styling from the reinstall button, and kept the minimalist two-button layout with updated accessibility attributes.
- Bumped `web/version.json` to `20251116-144706` to reflect the additional web-layer edits.

## Results
- Remote logging configuration can now toggle state without running afoul of `Object.freeze` while the logger continues to read the shared flag.
- The settings screen presents the toggle first, and the reinstall button now matches the rest of the controls, preserving the UX requirements from `ctx/rules/web/ui/screens/settings.md`.
- `npm run test:unit` still fails at `test/unit/Back/Service/Signal/Server.test.mjs` because the sandbox prevents WebSocketServer from binding to the requested port (`listen EPERM: operation not permitted`).
