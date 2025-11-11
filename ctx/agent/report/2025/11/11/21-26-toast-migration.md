# Toast Migration

- **Goal:** Replace legacy inline hints with the centralized `HomeCall_Web_Ui_Toast` system and wire it into the Core app, media manager, and enter screen.
- **Work:** removed the inline enter error element, added the global `#toast-container`, rewired the toast module to own DOM rendering, and refactored `Core`, `MediaManager`, and `Enter` to inject/use the shared toast service; refreshed CSS/HTML and kept `#media-status`/`#cache-status` for informational use.
- **Version:** bumped `web/version.json` → `20251111-212554` to signal the web-layer update.
- **Testing:** `npm run test:unit` *(fails: the script runs `node --test test/unit`, but Node errors out with `Error: Cannot find module '/home/alex/work/app/pwa-home-call/test/unit'`, as before)*.
