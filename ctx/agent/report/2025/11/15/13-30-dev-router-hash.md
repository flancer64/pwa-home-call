# Dev router hash screens
## Goal
- enable the development router to trigger each UI screen via hash navigation so the invite screen can be forced from `#invite`.

## Actions
- let `showInviteScreen` accept explicit `sessionId`/`inviteUrl` overrides, expose the `showHome`, `showInvite`, `showCall`, and `showEnd` helpers on `HomeCall_Web_Ui_Flow`, and keep the existing preparation flow intact.
- rolled the web version forward to `20251115-132938` per `web/AGENTS.md` so the new build is picked up by the PWA update mechanism.

## Result
- the dev router can now call the flow helpers and the hash fragments (`#home`, `#invite`, `#call`, `#end`) switch the UI screens as intended, even outside the standard call lifecycle.
- the version bump guarantees the PWA metadata reflects this UI fix.

## Testing
- `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` exits with `'test failed'`).*
