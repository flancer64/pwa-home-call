# Контур signal

Путь: `ctx/composition/signal/AGENTS.md`

## Назначение

Каталог `signal/` содержит реализацию фактического обмена сообщениями и runtime WebSocket, используемого в текущем исполнении HomeCall.

## Карта уровня

- `messaging/` — форматы JSON-сообщений и описание протокола.
- `AGENTS.md` — текущий указатель.
- `runtime.md` — фактическое поведение WebSocket `wss://<host>/signal` во время одного `sessionId`.
