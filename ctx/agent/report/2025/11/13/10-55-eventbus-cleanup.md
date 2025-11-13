# EventBus cleanup for web layer
**Goal:** remove the shared `EventBus` dependency from the web contour so all interactions rely on direct `on*` callbacks.

**Actions:** replaced the `SignalClient`, `Peer`, and `Toolbar` wiring with explicit subscription helpers, redirected the core invite flow to call `ui.showInvite` callbacks, trimmed the remaining `EventBus` emissions from `MediaManager`/`Enter`, and removed the shared module from the registry plus its type alias and service-worker manifest.

**Results:** the toolbar now listens to `SignalClient.onStatus` and `Peer.onConnectionState`, share/invite flows no longer emit bus events, and the web version stamp was bumped to `20251113-104115`.

**Testing:** `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` aborts with a historical `"test failed"` error that predates this change).*
