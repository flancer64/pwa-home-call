# Home call simplification

- collapsed the Core state machine to **home → call → end**, removed the lobby/tournament toolbar plumbing, and wired share-link creation + `toast` feedback directly into `startOutgoingCall`/`startIncomingCall` flows so the app only handles `offer/answer/candidate/error` signals.
- refactored the UI stack: the enter screen now serves as the `home` screen, the call screen only exposes the remote feed + end button, the end screen displays a single message/button, and the CSS/HTML no longer reference indicators or menus; `Lobby` assets remain only to satisfy the service worker cache list but are no longer used.
- simplified Net/Rtc tests and signal client/peer mocks to align with the lean flow; regenerated `web/version.json` to `20251114-062105` so the PWA cache layer sees a new bundle.

## Tests

- `npm run test:web`
