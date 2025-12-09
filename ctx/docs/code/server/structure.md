# Структура серверного контура

Path: `./ctx/docs/code/server/structure.md`

Серверный код располагается в `bin/` (composition root) и `src/Back/`. Он инициализирует DI, настраивает окружение и отдаёт управление модулю `HomeCall_Back_App`.

- `bin/server.js` — единственная точка входа: импортирует `dotenv`, создаёт контейнер `@teqfw/di`, добавляет namespace-роуты (`HomeCall_Back_`, `HomeCall_Web_`), регистрирует `HomeCall_Back_Logger` и запускает `HomeCall_Back_App$`.
- В `src/Back/` находятся `App.js`, `Logger.js` и сервисы (`Service/Signal`). Каждый файл экспортирует namespace `HomeCall_Back_*` и описывает декларативные методы (`run`, `stop`, `start`, `register`).
- Переменные окружения (`WS_PORT`, `WS_HOST`, `LOG_LEVEL`) задаются через `.env`, а `bin/server.js` делает `dotenv.config()` перед созданием контейнера.
- Логика должна быть асинхронной: `HomeCall_Back_App.run`/`stop` возвращают `Promise<void>`, `Signal_Server` управляет lifecycle WebSocket-сервера, а `App` не содержит бизнес-логики, только координаторы.

Контейнер не содержит бизнес-логики: он только подготавливает заказы (logger, signal server, session manager) и вызывает их методы `start`/`stop`. Все сложности остаются внутри сервисов и контуров `signal`/`direct-interaction`.
