# Iteration Report — Remove Settings Button

## Goal
Remove the unused “Open settings” toolbar button across the HomeCall web UI and documentation so that permissions handling is fully automatic.

## Actions
- Removed the `toolbar-settings` element from `web/index.html`.
- Stripped the layout binding, toolbar handler, and `openBrowserSettings()` helper from `web/app/Core/App.mjs`, leaving only the remaining three toolbar controls.
- Updated the UI layout and screen documentation to drop the settings entry and any references to manual browser links, noting that `HomeCall_Web_Media_Manager` now handles blocked devices automatically.

## Result
- Application UI now exposes only the clear cache, toggle media, and refresh buttons, with no code paths referencing a settings button.
- Documentation no longer mentions `toolbar-settings`, “Open settings”, or manual `chrome://settings/...` links and instead emphasizes the automated permission handling.
