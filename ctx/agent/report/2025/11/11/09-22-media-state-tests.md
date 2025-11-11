# Media state contract tests

**Goal**
- Document and verify the public behaviour of `HomeCall_Web_State_Media` through isolated unit tests that follow the Web testing rules.

**Actions**
- Created `test/web/app/State/Media.test.mjs`, mirroring the module path and importing `createWebContainer` for each test case.
- Added cases that exercise `initState`, the `set*` helpers, `get()`, and listener registration so we assert states, events, idempotence, and listener cleanup without touching internal data.
- Confirmed isolation by instantiating two containers, mutating one, and asserting the other stays at its default state.
- Ran `npm run test:web` to ensure the new suite joins the existing browser-focused tests.

**Results & Testing**
- `npm run test:web` *(pass)*
