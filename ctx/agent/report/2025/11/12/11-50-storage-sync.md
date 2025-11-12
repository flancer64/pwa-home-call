# Storage sync for Enter flow

- Goal: wire the infra storage module into the Core App and Enter UI so saved user/room pairs load automatically, persist on connection, and clear with cache resets while emitting the required toast notifications.
- Key changes: `HomeCall_Web_Core_App` now pulls `HomeCall_Web_Infra_Storage$`, broadcasts `storage:loaded`, pre-populates the Enter screen, and clears persisted data during cache reset; `HomeCall_Web_Ui_Screen_Enter` seeds the inputs, saves via storage with `Data saved` / `Failed to save data` toasts, and signals storage events; the storage module now reports success/failure, `web/app/types.d.js` documents the dependency, and tests across `Core/App`, `Infra/Storage`, and `Ui/Enter` cover the new flows. `web/version.json` was refreshed to `20251112-115022`.
- Tests: `npm run test:web`
