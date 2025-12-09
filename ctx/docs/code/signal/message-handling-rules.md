# Правила обмена сигналами

Path: `./ctx/docs/code/signal/message-handling-rules.md`

Signal-сообщения — канальный договор между клиентом и сервером. Оба слоя работают с 동일ным набором типов, payload ограничены конкретными полями, а `sessionId` — единственный идентификатор, который проходит по каналу.

## Параметры подключения

- WebSocket-путь фиксирован: `wss://<host>/signal`. Клиент передаёт `sessionId` через query `?sessionId=<id>`, сервер извлекает его во время handshake и вызывает `SessionManager.register(socket, sessionId)`.
- Сервер (см. `HomeCall_Back_Service_Signal_Server`) не запускает сессию без `sessionId`: если параметр отсутствует или пуст, соединение отклоняется, а клиент получает `error`.
- `SessionManager` ограничивает участников двумя сокетами, регистрирует `sessionId`, очищает данные при `deregister`, а `getPeers(sessionId)` возвращает оставшихся участников.

## Формат сообщений

Все payload включают поля `type` и `sessionId`. Разрешённые `type`:

1. `offer` — содержит поле `sdp` (строка). Предназначен для передачи SDP от инициатора к remote-peer.
2. `answer` — содержит `sdp` от принимающей стороны.
3. `candidate` — содержит объект `candidate` (с `candidate`, `sdpMid`, `sdpMLineIndex`).
4. `hangup` — содержит `initiator` (`caller` или `callee`) и служит для очистки session.
5. `error` — содержит `message` и опциональный `code`.

Дополнительные поля (`from`, `to`, `queue`) запрещены: сервер и клиент игнорируют всё, что не входит в список выше.

## Серверные правила

- `Signal_Server` проверяет `type` и `sessionId` перед тем, как вызвать `buildSignalPayload`. Если поле пустое или `type` неизвестен, он отправляет `error` и пишет warn.
- Payload пересылается другим участникам с помощью `SessionManager.getPeers(sessionId, socket)`. Сообщения логируются через `[Signal]` и записываются в файл `tmp/signal-server.log` для диагностики.
- При `hangup` сервер удаляет socket из сессии и не хранит никакой информации после закрытия; если все участники вышли, запись удаляется.

## Клиентские правила

- Клиентская сторона использует `HomeCall_Web_Net_Signal_Client` и `HomeCall_Web_Net_Signal_Orchestrator`: отправка осуществляется через `sendOffer`, `sendAnswer`, `sendCandidate`, `sendHangup`, `sendError`.
- Все сообщения проходят через `normalizeSessionId` и отправляются только при состоянии открытого сокета; иначе payload добавляется в очередь `pending`.
- Клиент логирует каждое отправленное и полученное сообщение (`signalLog.debug/info`) и при переподключении заново отправляет последнее описанное состояние (`lastDescription`, `localCandidates`).
- Обработчики (`onOffer`, `onAnswer`, `onCandidate`, `onHangup`, `onError`) передаются `Signal_Orchestrator`, который очищает списки при замене и не допускает утечек.

## Тестирование

- Тесты проверяют, что сервер отвергает сообщения без `sessionId`, что `candidate` требует `sdpMid`, что `hangup` вызывает `deregister`, а `offer/answer` пересылаются остальным участникам.
- Web-тесты используют mock-сервер, который принимает только определённые payload и вставляет их в `handlers`, не допуская дополнительных полей.
