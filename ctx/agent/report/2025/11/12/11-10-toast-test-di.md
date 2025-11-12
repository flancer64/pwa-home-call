# Iteration report

- **Goal:** Align `test/web/app/Ui/Toast.test.mjs` with `ctx/rules/web/testing.md` by removing direct imports and using the shared DI container.
- **Actions:** Created a fresh container per test, registered the fake env/logger fakes through `container.register`, and loaded `HomeCall_Web_Ui_Toast$` via the container before exercising its API; executed `npm run test:web` to confirm the suite still passes.
- **Result:** Toast test now complies with container usage rules and all web tests succeed without direct module imports.
