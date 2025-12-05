# DI-контракты серверного слоя

Path: `./ctx/code/server/di-contracts.md`

Server-контур собирает backend-граф через `@teqfw/di`. Такой контракт обеспечивает логирование, сигналинг и lifecycle запуска/остановки.

- `HomeCall_Back_App$` — главный модуль: получает `HomeCall_Back_Contract_Logger$` и `HomeCall_Back_Service_Signal_Server$`, вызывает `run()` и `stop()` и не содержит бизнес-логики.
- `HomeCall_Back_Service_Signal_Server$` — инкапсулирует создание `WebSocketServer`, использует `WS_PORT`/`WS_HOST`, логирует через `[Signal]` и передаёт события в `SessionManager`.
- `HomeCall_Back_Service_Signal_SessionManager$` — управляет пространством `sessionId`, регистрирует и deregistrирует sockets, возвращает peers, следит за тем, чтобы сессия не держала более двух участников.
- `HomeCall_Back_Contract_Logger$` и `HomeCall_Back_Logger$` — логгеры, регистрируемые в контейнере; все server-модули используют их для сообщений, исключений и предупреждений.
Серверные DI-контракты остаются декларативными: модули сообщают, какие зависимости им нужны, а контейнер гарантирует их наличие, не дублируя логику запуска.
