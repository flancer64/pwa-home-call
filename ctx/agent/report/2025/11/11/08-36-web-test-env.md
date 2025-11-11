# Web test environment fix

**Goal**
- Get the existing `test/web` suite passing again without changing the actual production logic.

**Actions**
- Restored the production code files (`Core/App`, `Core/UiController`, `Media/Manager`) so they stay untouched.
- Hardened the `App` integration test by mocking the DOM selectors it uses (`cta` button/panel, toolbar buttons, cache status), adding the missing `updateConnectionStatus` hook on the fake call screen, and asserting the real “Звонок завершён.” message after a call ends.
- Updated the media manager unit test to expect the localized status text (`Камера и микрофон готовы.`) instead of the English copy.
- Removed the auxiliary debugging script now that the suite passes.
- Documented the iteration in this report.

**Results & Testing**
- `npm run test:web` *(pass)*
- `npm run test:unit` *(fails: `node --test test/unit` cannot find `test/unit` in the repo)*
