# Peer Regression (2025-11-16 21:11)

- **Goal:** Revert `HomeCall_Web_Rtc_Peer` to the simpler offer/answer/candidate model, keep the publicly documented API, and ensure CallFlow continues to wire up signals the same way as the working HomeCall version.
- **Actions:** Rebuilt the peer to drop pending-candidate/restart helpers, simplified the track handler, added the documented TURN configuration, and ensured all send handlers receive an explicit target; updated CallFlow to set the session ID as the target, pass incoming metadata to the peer, and honor the new handler signatures.
- **Results:** Remote stream wiring and ICE handling now mirror the older code path, and the Flow wiring still meets the public API requirements. `npm run test:unit` currently fails at `test/unit/Back/Service/Signal/Server.test.mjs` because the sandbox forbids listening on `127.0.0.1` (`Error: listen EPERM: operation not permitted 127.0.0.1`).
