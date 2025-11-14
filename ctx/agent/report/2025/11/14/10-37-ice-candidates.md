# ICE Candidate Stabilization

- **Goal:** Restore reliable WebRTC setup by preserving ICE metadata, adding TURN fallback, and making the signaling path observable.
- **Actions:** Added the TURN relay, richer ICE logging, and candidate init defaults in `web/app/Rtc/Peer.mjs`, normalized the payload that `CallFlow` sends to `SignalClient` so `sdpMid`/`sdpMLineIndex` survive JSONification, and double-checked that `beginCallSession` already joins the room before `peer.start()` while `src/Back/Service/Signal/Server.js` simply forwards the untouched candidate envelope.
- **Results:** Candidate messages now reach the browser with the required metadata, ICE additions log their state, the TURN server stands ready as a fallback, and the signaling route remains synchronous and addressable.
- **Version:** Updated `web/version.json` → `20251114-103618`.
- **Testing:** `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` still aborts with the longstanding `'test failed'` outcome; this backend suite has been historically blocked here).*
- **Commit:** pending (not yet created)
