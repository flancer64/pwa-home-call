# Reconnection iteration

## Goal
- Add automatic WebRTC reconnection with soft/hard flows, UI feedback, logging, and retry limits to the browser app.

## Work
- Added `restartIce`/`forceReconnect` helpers to `HomeCall_Web_Rtc_Peer` and emitted reconnect state changes.
- Expanded `HomeCall_Web_Core_App` state (target/retries) to orchestrate soft/hard reconnection, limit retries to 3, surface "Потеря связи, пытаемся восстановить…" status, and log every stage while keeping the call UI in sync.
- Updated the call screen template and controller to support the reconnect notice element, and wired the `UiController` facade accordingly.

## Tests
- `npm run test:unit` *(fails: `node --test test/unit` cannot find the `test/unit` entry point, so the suite aborts immediately.)*
