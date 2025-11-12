# Iteration report

- **Goal:** Remove direct imports of `Core/UiController` and `Pwa/CacheCleaner`, relying on `createWebContainer()` per `ctx/rules/web/testing.md`.
- **Actions:** Adjusted both tests to create a fresh container, register stub screens and environment providers through `container.register`, retrieved `HomeCall_Web_Core_UiController$` and `HomeCall_Web_Pwa_CacheCleaner$` from the container, and preserved the original assertions while respecting object immutability; verified via `npm run test:web`.
- **Result:** Tests now comply with DI requirements and the web suite continues to pass without leaking state or mutating frozen instances.
