# Domain model refresh
**Goal:** align the frontend core and storage layers with the new myName/myRoomId domain without touching the UI or invite flows, so that later iterations can only focus on simplifying user inputs.

**Actions:**
- Rebuilt `HomeCall_Web_Infra_Storage` to persist `{ myName, myRoomId, lastUpdated }`, provide the new synchronous API (`getMyData`, `setMyName`, `ensureMyRoomId`, `resetMyData`), and keep the legacy `userName`/`roomName` helpers for compatibility while automatically migrating old payloads.
- Updated `HomeCall_Web_Core_App` state initialization, `showEnter`, and cache-clear helpers to rely on the new data shape, added the bridged `resetMyData` helper, and kept backwards-compatible `state.userName`/`state.roomCode` wiring for the UI.
- Extended the storage and core unit tests to cover the new storage API, migration path, and clearing behavior, and verified the main suites (noting the existing backend signal server test still fails with the historical `test failed` error).

**Results:**
- Storage now stores only the mandated user fields, auto-migrates legacy entries, and exposes helpers needed by future iterations.
- Core app exposes `resetMyData` and keeps its legacy UI-facing state in sync with the new model while initializing from the migrated values.
- Tests reflect the new behavior; the remaining backend failure is a known pre-existing issue.

**Testing:** `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` still aborts with the historical `"test failed"`).* 
