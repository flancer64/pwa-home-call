# Rules Analysis: WebRTC + Infra Contours

## Scope
- `arch/rtc/signaling.md`
- `arch/rtc/media-flow.md`
- `web/infra/ws.md`
- `web/infra/pwa.md`
- `web/infra/storage.md`
- `web/contours/net.md`
- `web/contours/rtc.md`
- `web/contours/media.md`
- `web/contours/env.md`
- `web/contours/shared.md`

## Existing narrative
These documents capture the canonical WebRTC choreography: a session per `sessionId`, one `RTCPeerConnection`, message types `offer/answer/candidate/hangup`, queued delivery for the second participant and media preparation before SDP. The infra docs explain how the service worker caches assets, how storage flags serve the PWA, and how the env contour collects the `session` parameter from the URL for bootstrap. Media/net/rtc contours specify direct DI callbacks and avoid event buses.

## Product gap
- The product-level story (`overview.md`, `capabilities/connection.md`) frames WebRTC as happening **inside a transparent, single-window session** with states (`ready`, `waiting`, `active`) and inline link-sharing, whereas the WebRTC docs still speak about “call” as a discrete stage. They need an explicit tie to the new state machine so that the signaling/media docs emphasise “media flow begins when the window is in the `waiting` state and transitions to `active` when the remote stream is attached”.
- `web/infra/ws.md`, `arch/rtc/signaling.md` describe the protocol in isolation; they should mention the product-level constraints (“minimal server state”, “message bound to session until hangup”, “link lifetime matches call lifetime”) described in `overview.md` and `capabilities/link-sharing.md`.
- `web/infra/storage.md` and `web/infra/pwa.md` already promote minimal storage of metadata, but they still refer to a separate invite screen/`sessionId` handshake before the call — this should be reworded to show that storage is only used for PWA flags, that `sessionId` is derived from the currently running session, and that no identity or invite logs are persisted.
- The env contour’s `getContext()` still emphasises exposing the `session` parameter as a means to know which screen to show; it should instead present the parameter as “the in-progress session ID inside the same window”, reinforcing that there are no separate invites or rooms.

## Required updates
1. Introduce explicit references to the `ready → waiting → active` lifecycle from `capabilities/connection.md` inside the signaling/media docs so they read as **technical enablers of the same state machine** rather than independent screens.
2. Mention in `web/infra/ws.md` and `arch/rtc/signaling.md` that the server only tracks the session for the duration of the current call (no personal data, no persistent rooms), matching `overview.md`’s “minimal technical state” language.
3. Clarify that `sessionId` is generated once per call and stays tied to the same window until hangup; the `media-flow` document should highlight that the local stream is prepared once the window enters the `waiting` state and is maintained until the `active` state (no additional screens).
4. Emphasize in the env/media/net contours that all callbacks flow through DI within the same window and that the `session` parameter extracted from the URL simply resurrects the current session, not a new invitation—this prevents accidental references to multiple screens when teams later refactor the UI.
