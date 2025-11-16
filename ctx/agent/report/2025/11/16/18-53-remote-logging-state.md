# Remote logging state indicator

- **Goal:** make the settings toggle visibly reflect whether remote logging is enabled so the user can tell the current state without guessing.
- **Actions:** added a status chip inside the remote logging button that updates via `HomeCall_Web_Ui_Screen_Settings$`, extended the template/CSS for `.settings-remote-logging-state`, and refreshed `web/version.json` to `20251116-185336` per the web-layer rule.
- **Results:** the toggle now shows `Вкл`/`Выкл`, tags the button with `data-state`, and keeps the aria attribute in sync; the UI change is covered by the latest web tests via the existing remote logging spec and the version bump is logged.
- **Testing:** `npm run test:web`
