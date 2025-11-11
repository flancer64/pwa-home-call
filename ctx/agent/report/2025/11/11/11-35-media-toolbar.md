# Media toolbar indicators

- **Goal:** provide live camera and microphone state indicators inside the global toolbar.
- **Actions:** added the toolbar indicator markup and styling, implemented `HomeCall_Web_Ui_Toolbar` with media state subscriptions, copied the required Lucide SVGs, wired the toolbar into `HomeCall_Web_Core_App`, and updated the Core App test stub to cover the new dependency.
- **Results:** toolbar indicators now respond to media state changes, all referenced icons reside in `web/assets/icons`, and `npm run test:web` passes.
- **Testing:** `npm run test:web`
