# Accessibility and comfort refresh

## Goal
- Align the HomeCall screens with the §6 “Доступность и комфорт для пожилых пользователей” requirements, keeping the existing UI flows intact.

## Actions
- Raised the global typography baseline, centralized text, enlarged buttons and containers, reorganized the call layout, and restyled alerts/toasts in `web/assets/style.css`.
- Reworked `web/ui/enter.html`, `web/ui/lobby.html`, `web/ui/call.html`, and `web/ui/end.html` so each screen highlights concise explanations, larger CTAs, and the updated positioning for controls.
- Extended `web/app/Media/Manager.mjs` to keep toasts visible for 5 seconds and add a “Понятно” confirmation action without disturbing existing event flows.

## Results
- Visual experience now delivers higher contrast, legible fonts, and larger controls for all four screens while keeping them responsive.
- `node --test test/web/app/**/*.test.mjs` (pass).
