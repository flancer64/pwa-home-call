# Messaging стек

Путь: `ctx/composition/signal/messaging/AGENTS.md`

## Назначение

Каталог фиксирует формат и порядок сообщений, которые реально передаются по WebSocket, не выходя за границы одного `sessionId`.

## Карта уровня

- `message-formats/` — конкретные JSON-форматы (`offer`, `answer`, `candidate`, `hangup`, `error`).
- `AGENTS.md` — текущий файл.
- `protocol.md` — последовательность обмена сообщениями во время одного сеанса.
