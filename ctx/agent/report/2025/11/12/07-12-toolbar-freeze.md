# Toolbar freeze fix 2025-11-12 07:12

- **Goal:** Resolve the frozen-instance errors from `@teqfw/di` by avoiding property assignments on the toolbar singleton.
- **Changes:** Rewrote `web/app/Ui/Toolbar.mjs` so all mutable state lives in constructor-local variables/closures, keeping interaction helpers (`onAction`, `setContext`, `setMediaButtonState`, `toggleMenu`) as functions bound to the frozen instance. `ACTION_HANDLERS` still uses a `WeakMap`, and the initialization path now relies on closure helpers instead of instance properties, keeping alignment with `ctx/rules/arch/teqfw/di.md`.
- **Tests:** `npm run test:web`.
