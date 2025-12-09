# DI-контракты сигналингового слоя

Path: `./ctx/docs/code/signal/di-contracts.md`

Signal-компоненты получают и передают события только через `@teqfw/di`. Ниже перечислены 핵심ные контракты и их обязанности.

- `HomeCall_Back_Service_Signal_Server$` — серверная точка входа: создаёт `WebSocketServer`, обрабатывает handshake, следит за `WS_PORT`/`WS_HOST`, передаёт логи `HomeCall_Back_Contract_Logger$` и дисквалифицирует лишние payload.
- `HomeCall_Back_Service_Signal_SessionManager$` — хранит соответствие сокетов и `sessionId`, ограничивает до двух участников, предоставляет `register`, `deregister`, `getSessionId`, `getPeers`.
- `HomeCall_Back_Contract_Logger$`/`HomeCall_Back_Logger$` — логирование событий signal-сервера и менеджера сессий, всегда с namespace `Signal` и только английскими сообщениями.
- `HomeCall_Web_Net_Signal_Client$` — WebSocket-клиент на фронте; поддерживает очередь сообщений, оборачивает логгер `[Signal]`, кэширует `sessionId`, обрабатывает reconnect и передаёт payload в orchestrator.
- `HomeCall_Web_Net_Signal_Orchestrator$` — связывает `Signal_Client` с другими модулями (Flow, Peer). Экспортирует `bindHandlers`/`cleanup` и гарантирует снятие обработчиков при destroy.
- `HomeCall_Web_Net_Session_Manager$` — генерирует `sessionId`, собирает invite URL, очищает параметр из `window.history` и передаёт результат signal-клиенту.
- `HomeCall_Web_Logger$` — клиентский логгер, оборачивающий `console` и передающий префиксы `[Signal]`/`[Net]`.
- `HomeCall_Web_Env_Provider$` — скрывает доступ к `window`, `navigator`, `WebSocket` и `localStorage`, а signal-клиент использует встроенные объекты только через эту прослойку.

Контракты не содержат бизнес-логики, они инкапсулируют транспорт, проверку JSON, регистрацию `sessionId` и очистку обработчиков, чтобы другие контуры могли фокусироваться на UI/RTC.
