# Front Refactor Report

## Summary
- Rebuilt the web frontend around the contour hierarchy described in `ctx/rules/arch/front.md`, migrating every Core/Env/Ui/Media/Net/Rtc module into `web/app/<Contour>/...` so each namespace fragment now maps to a directory and module file per TeqFW DI conventions.
- Rearranged every DI namespace to follow TeqFW path rules (e.g., `HomeCall_Web_Core_App$` → `/web/Core/App.mjs`), so each namespace fragment maps to a directory and the final module exports the same class.
- Added the `Shared` contour (`EventBus`, `Logger`, `Util`) and wired Core/Media/Net/Rtc to the bus and logger so cross-contour events flow through `@teqfw/di` instead of globals.
- Updated bootstrap and tests (`test/web/**`) to honor the new layout, and ensured the DI helper loads the new workspace root for the bootstrap and mirrored unit-tests.

## Testing
- `npm run test:web`

## References
- `ctx/rules/arch/front.md`
- `ctx/rules/web/*`
- `ctx/rules/arch/testing.md`
