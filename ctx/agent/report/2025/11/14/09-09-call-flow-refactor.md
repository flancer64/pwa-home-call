# Call Flow Refactor

- Extracted the state machine, room manager, invite service, signal orchestrator, and call flow orchestration out of `HomeCall_Web_Core_App` so the app is now a thin environment initializer.
- Rewrote `HomeCall_Web_Core_App` to initialize the DOM, bind the signal orchestrator, and hand control over to `HomeCall_Web_Core_CallFlow` without carrying business logic itself.
- Added the new modules under `web/app/Core/`, wired them into DI, and updated the shared typedefs.
- Updated `web/version.json` to `20251114-090942` per `web/AGENTS.md` so the PWA version bumps alongside web changes.

# Version
- `web/version.json` → `20251114-090942`

# Testing
- Not run (not requested).
