# Структура кода сигналинга

Path: `./ctx/docs/code/signal/structure.md`

Signal-контур включает Node.js-сервер и WebSocket-клиент на фронтенде. Он состоит из трёх слоёв: сервер, клиент и общие модули, хранящие сессии и проверяющие сообщения.

- `src/Back/Service/Signal/` — сигнальный сервер и менеджер сессий (`Server.js`, `SessionManager.js`). Здесь находятся `HomeCall_Back_Service_Signal_Server` и `HomeCall_Back_Service_Signal_SessionManager`, которые классами описывают `start`, `stop`, `register`, `deregister` и логгируют через `[Signal]`.
- `web/app/Net/Signal/` — signal-клиент (`Client.mjs`) и orchestrator (`Orchestrator.mjs`). Клиент работает через `HomeCall_Web_Net_Signal_Client` и пересылает payload с `sessionId`, `offer/answer/candidate/hangup/error`; orchestrator регистрирует callback-ы и очищает обработчики.
- `test/unit/Back/Service/Signal` и `test/web/app/Signal` повторяют эти каталоги для модульных тестов.
- `web/app/Net/Session/Manager.mjs` поддерживает `sessionId`, invite URL и очистку параметров из `window.history`, передавая `sessionId` signal-клиенту.

Signal-код содержит только WebSocket-логику и не занимается UI или media: state и flow управляются другими контурами, signal остаётся транспортом, поэтому все преобразования payload делаются внутри signal-модулей.
