# Правила модулей серверного слоя

Path: `./ctx/docs/code/server/module-rules.md`

Серверные модули содержат только системные операции: настройка DI, запуск WebSocket, логирование и завершение. Они не привязаны к UI и не хранят session-потоки дольше необходимого.

- `bin/server.js` остаётся минимальным: вызывает `dotenv.config()`, создаёт контейнер, добавляет namespace-роуты, разрешает `HomeCall_Back_Logger`, регистрирует `HomeCall_Back_App$` и вызывает `run()`/`stop()`. Любая логика, связанная с бизнесем или сигналингом, переходит в `src/Back/Service/Signal`.
- `HomeCall_Back_App` запускает/останавливает сервер (`run()`/`stop()`) и оборачивает вызовы `HomeCall_Back_Service_Signal_Server`. Методы возвращают `Promise<void>` и логируют события через `HomeCall_Back_Contract_Logger$`.
- Сервисы (`Signal_Server`, `SessionManager`) получают свои зависимости через DI и не используют глобальные переменные. `Signal_Server` проверяет `WS_PORT`, `WS_HOST`, `sessionId`, логирует через `[Signal]` и не хранит состояние между сессиями.
- Логгер `HomeCall_Back_Logger` форматирует сообщение `[timestamp] [LEVEL] [namespace] message` и используется всеми модулями backend (App, Signal, DI). Не добавляйте `console.log` в production-код, только логгер.
- Любые дополнительные серверные модули (`Config`, `Env`) регистрируются в контейнере и описывают `start`/`stop` или `getConfig`. Они не должны напрямую обращаться к `web/`.
