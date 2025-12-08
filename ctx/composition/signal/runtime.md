# Runtime сигналинга

Путь: `ctx/composition/signal/runtime.md`

## Назначение

Фиксирует факт, что WebSocket `wss://<host>/signal` живёт вместе с `sessionId` и обслуживает два потока (host/guest) без дополнительного контурирования.

## Поведение

- Соединение открывается при переходе в `waiting/active` и остаётся открытым до `ended` или `hangup`.
- Сервер ретранслирует сообщения, сохраняя `sessionId` в очереди для двух клиентов; каждый приёмник просто проверяет `type` и обновляет UI.
- При повторном подключении client повторно использует тот же `sessionId`; DOM-элементы `remoteStream` и FAB остаются на месте и просто получают новые события.
- `error`-сообщения отображаются через `notifications`, а `hangup` приводит к показу `ctx/composition/client/ui/screens/end.md`.

## Связи

- `ctx/composition/signal/messaging/message-formats/websocket.md` содержит набор полей, которые положены в основу runtime.
- `ctx/composition/client/ui-states/states.md` описывает, какие UI-фрагменты соответствуют каждому состоянию, которое сопровождает WebSocket.
