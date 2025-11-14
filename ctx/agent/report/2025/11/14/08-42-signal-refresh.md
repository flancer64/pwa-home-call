# Signal refresh

## Goal
- simplify WebRTC signaling flow so calls start immediately without waiting for online events and ensure the server only relays offers/answers/candidates.

## Actions
- removed the online-dependent state from `web/app/Core/App.mjs`, started the peer connection immediately for initiators and recipients, and kept the UI focused on the call screen.
- trimmed the signaling server (`src/Back/Service/Signal`) down to join/leave routing plus offer/answer/candidate forwarding and exposed `WS_HOST` so tests can run without binding to `0.0.0.0`.
- updated unit tests to no longer rely on online broadcasts, added the new host env, and bumped `web/version.json` to `20251114-083411`.
 - allowed the server to forward messages addressed to the constant `peer` by routing them to the other participant in the room so initiators can target `peer` before a remote name is known, now with a short-lived queue that delivers missed packets as soon as the second socket joins.

## Results
- PWA now starts WebRTC as soon as a room exists and no longer waits for server-side status or online lists.
- The backend simply relays signaling messages and no longer emits online snapshots.
- Local version file is now `"20251114-083411"` to signal the client build update.

## Tests
- `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` still cannot start because the sandbox refuses to bind sockets anywhere; `listen EPERM: operation not permitted` even with `WS_HOST=127.0.0.1`).*
