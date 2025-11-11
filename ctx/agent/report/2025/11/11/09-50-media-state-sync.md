# Media state synchronization

- **Goal:** ensure `HomeCall_Web_State_Media` reflects the actual media lifecycle managed by `HomeCall_Web_Media_Manager`.
- **Actions:** injected the media state into the manager, added helpers to emit initializing/ready/paused/blocked/unsupported/off transitions, and synchronized stream toggling with the state snapshot; also asserted state updates in the media manager unit test.
- **Results:** toolbar indicators now receive meaningful state changes when media preparation, toggles, errors, or device absence happen, and `npm run test:web` continues to pass.
- **Testing:** `npm run test:web`
