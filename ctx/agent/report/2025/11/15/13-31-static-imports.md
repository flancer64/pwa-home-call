# Removed static web imports from tests

## Goal
- eliminate forbidden static imports of `web/app` modules in the browser unit tests as required by `ctx/rules/web/testing.md`.

## Actions
- reworked `test/web/app/Ui/Enter.test.mjs` to obtain the enter screen via `createWebContainer()` and a stubbed `HomeCall_Web_Ui_Templates_Loader$`, removing the previous `import HomeCall_Web_Ui_Screen_Enter`.
- rewrote `test/web/app/Net/Session/Manager.test.mjs` to register `HomeCall_Web_Env_Provider$` in the container and fetch `HomeCall_Web_Net_Session_Manager$` from DI instead of importing the class directly.
- verified `npm run test:web` succeeds with the DI-only approach, ensuring no tests statically import browser modules.

## Results
- All browser tests now rely exclusively on the DI container for accessing application modules, keeping the suite compliant with the architectural invariant.
- `npm run test:web` passes; `npm run test:unit` still fails in `test/unit/Back/Service/Signal/Server.test.mjs` (pre-existing).
