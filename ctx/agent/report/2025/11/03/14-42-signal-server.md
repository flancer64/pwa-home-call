# WebSocket signaling server integration

## Резюме изменений
- Added signaling room manager and WebSocket server modules under `src/Back/Service/Signal/`.
- Integrated signaling lifecycle into `HomeCall_Back_App` and expanded unit coverage.
- Updated unit test suite configuration and added comprehensive tests for signaling components.

## Детали работ
- Implemented `HomeCall_Back_Service_Signal_RoomManager` to keep per-room participant maps and expose join/leave/list/getSocket operations.
- Implemented `HomeCall_Back_Service_Signal_Server` using `ws`, handling `join`, `leave`, `offer`, `answer`, `candidate`, and `error` message types with logging and online roster broadcasts.
- Extended `HomeCall_Back_App` to manage the signaling server lifecycle via DI and enriched logging semantics.
- Added unit tests for the room manager and WebSocket server, verifying participant tracking and signaling message routing, and adjusted the App test to assert signal server usage.
- Switched the unit test npm script to run the entire `test/unit` directory ensuring new suites are executed.

## Результаты
- `npm run test:unit` — all nine unit tests pass, including new signaling coverage.
- Signaling backend now starts automatically with the application and exposes `/ws/` endpoint as required.
