# Invite link flow

## Goal
- Implement the documented invitation flow so a link can be generated and consumed via the new invite screen.

## Actions
- Added the `invite` template and screen module, hooked it into the template loader and UI controller, and wired a new toolbar/menu entry.
- Extended the toolbar to hide the share action during calls and taught the Core app to handle `ui:action:share-link`, show the invite screen, build/share/fallback the URL, and absorb URL parameters into storage and the enter form.
- Hardened `handleShareLink` so it checks for the invite facade before showing the dialog and notifies the user when the helper is unavailable.
- Updated `App.test.mjs` and added `Invite.test.mjs` to cover the new wiring, share fallback, and UI validation, then ran `npm run test:web`.

## Results
- `npm run test:web` (pass)
