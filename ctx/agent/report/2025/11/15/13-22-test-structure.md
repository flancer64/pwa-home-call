# Test structure alignment

## Goal
- keep the Web UI unit tests mirroring the renamed namespace layout so each suite lives beside the modules it exercises.

## Actions
- moved `test/web/app/Core/App.test.mjs` → `test/web/app/App.test.mjs`, `test/web/app/Core/SessionManager.test.mjs` → `test/web/app/Net/Session/Manager.test.mjs`, and `test/web/app/Core/UiController.test.mjs` → `test/web/app/Ui/Controller/Controller.test.mjs`.
- adjusted imports where needed (especially the controller test helper path) so DI wiring stays accurate.
- reran `npm run test:unit` to validate the refactor; the suite still fails in the longstanding `test/unit/Back/Service/Signal/Server.test.mjs` test, so all Web UI specs pass.

## Results
- No `test/web/app/Core` directory remains; CI reflects the same hierarchy as the production modules.
- `npm run test:unit` gives the same pre-existing failure, proving the new test paths do not regress the rest of the suite.
