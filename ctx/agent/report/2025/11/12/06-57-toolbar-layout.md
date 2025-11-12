# Toolbar/Layout refresh 2025-11-12 06:57

- **Goal:** Bring the HomeCall UI inline with the updated screen architecture—remove the CTA footer, embed per-screen CTAs, and adopt the documented toolbar layout/menu.
- **Changes:**
  - Rebuilt `web/index.html` and `assets/style.css` so the toolbar now owns status indicators, the menu, and desktop/mobile behaviors, introduced the `menu.svg` asset, removed the bottom CTA panel, and added FAB/CTA styling for each screen.
  - Updated the Enter/Lobby/Call/End templates and their screen controllers so CTA buttons live inside each layout (including the end/return flow), keeping media/status controls self-contained.
  - Refactored `HomeCall_Web_Core_App` to drop CTA panel plumbing, hook the toolbar’s action handler/context updates, and simplify state transitions; rewrote `HomeCall_Web_Ui_Toolbar` to manage indicators, the menu, and action bubbling (exposing `onAction`/`setContext`/`setMediaButtonState` for the core app).
  - Adjusted the `App` test, refreshed stub providers, and bumped `web/version.json` to `20251112-065717`.
- **Tests:**
  - `npm run test:unit` *(fails: Node cannot find module `test/unit` as configured in the script).*
  - `npm run test:web`
- **Version:** `web/version.json` → `20251112-065717`
