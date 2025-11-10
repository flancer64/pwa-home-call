# UI Controller Facade

## Goal
introduce a UI controller facade that hides the individual screen implementations from `HomeCall_Web_Core_App` while keeping the UI layer easy to extend.

## Actions
- added `HomeCall_Web_Core_UiController` to coordinate Enter/Lobby/Call/End screens and expose unified methods without leaking internal references
- switched `HomeCall_Web_Core_App` to depend on the facade, consumed its methods, and kept all state transitions unchanged
- introduced a typedef for the controller and added `test/web/app/Core/UiController.test.mjs`, then ran `node --test test/web/app/**/*.test.mjs`

## Results
- App now relies on a single screen façade, keeping DI wiring localized
- `UiController` is covered by a new unit test that confirms each method delegates correctly
- tests: `node --test test/web/app/**/*.test.mjs`
