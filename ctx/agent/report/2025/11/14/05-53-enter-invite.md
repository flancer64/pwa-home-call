# Simplified enter + invite flow
**Goal:** align onboarding screens with the new «my room + name only» domain by removing manual room input and guest data from the invite experience.

**Actions:**
- replaced `ui/enter.html` and `HomeCall_Web_Ui_Screen_Enter` with a single-name form, automatic room resolution, and Russian save/error texts while relying on `myRoomId` for signaling.
- reworked the invite template and `HomeCall_Web_Ui_Screen_Invite` to keep only the prompt/confirm button and simplified `HomeCall_Web_Core_App` share URL, invite params, and enter flow so `roomCode` always mirrors `myRoomId`.
- refreshed related unit tests, storage interactions, and toast strings, plus updated `web/version.json` → `20251114-055337`.

**Results:**
- onboarding now uses only personal names, saves them via `setMyName`, and always joins `myRoomId` without exposing room codes to guests.
- the invite screen emits a bare confirmation event, `buildInviteUrl` produces `<origin>/?room=<myRoomId>`, and toolbar signaling stays consistent with the simplified state.
- `web/version.json` is now `20251114-055337`, ensuring the PWA layer sees the new build.

**Testing:** `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` still aborts with the pre-existing `"test failed"`)*
