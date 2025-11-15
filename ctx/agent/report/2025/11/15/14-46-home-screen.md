# 14-46-home-screen

## Goal
Bring the Kolobok home screen into compliance with `ctx/rules/web/ui/screens/home.md`, keeping the UI minimal and single-action.

## Work
- replaced the entry template with the new `home.html` layout, added the centered brand header, settings FAB, and single “Связать” call-to-action plus hint, and refreshed the supporting styles for the dark irish-green rhythm.
- renamed the screen module to `HomeCall_Web_Ui_Screen_Home`, wired its dependencies/tests/controller/types to the new name, and hooked the settings button into an optional handler.
- pointed the template loader/service worker at `ui/home.html` and bumped `web/version.json` → `20251115-124636` to satisfy the web-layer policy.

## Testing
- `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` still reports `test failed` — unrelated to the home screen changes)*
