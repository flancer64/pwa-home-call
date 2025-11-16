# Logger closure update

## Goal
- Refactor `HomeCall_Web_Logger` so it relies on closures instead of mutating `this` and keep remote logging payloads as plain text, satisfying the latest direction from AGENTS.

## Actions
- Reimplemented the logger constructor to capture console/fetch/navigator references in local variables, assign the public API via arrow functions, and rely on `prepareMessage` + `dispatchRemote` helpers defined inside the constructor.
- Simplified remote duplication: no JSON serialization, just plain `[id] [LEVEL] [namespace] message` text, which is sent via `sendBeacon`/`fetch` with `text/plain` headers.
- Bumped `web/version.json` to `20251116-150534` to reflect the web-layer change.

## Results
- `HomeCall_Web_Logger` no longer stores mutable state on `this`, satisfying the DI immutability guidance while still exposing `debug/info/warn/error` and remote-config helpers.
- Remote logging sends simple text payloads keyed by a 4-digit instance ID.
- `npm run test:unit` keeps failing at `test/unit/Back/Service/Signal/Server.test.mjs` because the WebSocket server cannot bind (`listen EPERM: operation not permitted`).
