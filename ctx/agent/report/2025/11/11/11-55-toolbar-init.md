# Toolbar initialization guard

- **Goal:** ensure the toolbar module stays compatible with the DI container's readonly exports.
- **Actions:** rewrote `HomeCall_Web_Ui_Toolbar` to rely on closure-scoped variables/methods instead of mutating properties, kept the subscription/update logic intact, and reran `npm run test:web` to prove no regressions.
- **Results:** toolbar init now only uses methods and closures, so DI no longer throws `Cannot assign to read only property '_initialized'` during startup.
- **Testing:** `npm run test:web`
