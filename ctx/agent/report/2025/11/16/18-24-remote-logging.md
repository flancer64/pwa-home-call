# Remote logging persistence

- **Goal:** keep the web logger in sync with the persisted remote logging flag so the setting sticks across sessions.
- **Actions:** wired `HomeCall_Web_Config_RemoteLogging$` into the app start-up (applying the stored flag to `HomeCall_Web_Logger$` before the PWA boots), taught the settings screen to mutate the logger (falling back to the config when the logger is unavailable), and refreshed `web/version.json` as required.
- **Results:** remote logging now rehydrates from localStorage before any UI code runs, settings toggle both the logger and the storage helper through a shared API, and the new UTC version `20251116-182419` was recorded alongside the change.
- **Testing:** `npm run test:web`
