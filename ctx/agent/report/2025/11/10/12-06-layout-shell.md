# Unified layout shell

- **Goal:** follow the UI layout guidance so every state shares the same toolbar/main-area/CTA shell while keeping call media unobstructed.
- **Actions:** rebuilt `web/index.html` and the four screen templates to live inside the new shell, rewrote `assets/style.css` plus toolbar icons to keep the layout fixed/responsive, updated the app core to manage the CTA text/action, toolbar button hooks, and cache/media/services logic, added the media toggle helper, and simplified the enter screen tests to match the new structure.
- **Result:** all screens render within a shared scaffold with a fixed icon-only toolbar, CTA footer, responsive centering, and state-aware behavior (media toggling, cache feedback, CTA updates, and call styling) while the icon assets now live in `assets/icons/`.
- **Tests:** Not run (not requested).
