# Screen interface unification

- **Goal:** unify the screen contract so the UI controller always feeds a single `params` object into each screen and expose that contract via `HomeCall_Web_Ui_Screen_Interface`.
- **Actions:** added the interface definition to `web/app/types.d.js`, documented and tagged every screen with `@implements`, refactored `Call` to an explicit `show(params)` method, and taught `HomeCall_Web_Core_UiController` (plus its unit test) to forward single argument objects to the screens.
- **Results:** the facade now talks to screens through the shared interface, call screen metadata and docs match the contract, and `App`/`UiController` wiring is consistent with the new signature. `npm run test:web` still fails because `test/web/Core/App.test.mjs` and `test/web/Media/Manager.test.mjs` each abort with `'test failed'`, so the suite exit code remains 1.
