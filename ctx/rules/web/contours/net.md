# Контур Net и сигналинг

Этот документ описывает контур **Net**, управляющий WebSocket-соединением сигналинга Колобок.

## Назначение

Net обеспечивает надёжную передачу SDP и ICE между участниками одного `sessionId`. Он не опирается на EventBus — коллбэки передаются через DI и работают синхронно.

---

## Границы и интерфейсы

- **WebSocket-протокол**: одно соединение `wss://<host>/signal` через `HomeCall_Web_Net_SignalClient$`; сообщения с типами `offer`, `answer`, `candidate`, `error` всегда содержат поле `sessionId`.
- **Входные команды**: `Core` передаёт `sessionId` и вызывает `sendOffer(sessionId, sdp)`, `sendAnswer(...)`, `sendCandidate(...)`; `Env` предоставляет URL `wss://`.
- **Выходные коллбэки**: `onSignal(payload)` с `sessionId` и телом `offer/answer/candidate`, которые передаются `Rtc`.
- **Протокол** не использует `join`/`leave` — присутствие фиксируется только `sessionId`, а повторные подключения просто используют тот же идентификатор.

Нет списков участников, нет комнат или имён; всё рассчитано на 1:1-связь внутри одного `sessionId`.

---

## Типичные DI-зависимости

- `HomeCall_Web_Net_SignalClient$`
- `HomeCall_Web_Net_EventTranslator$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Env_Provider$`
- `HomeCall_Web_Shared_Util$`

Net разворачивается через `@teqfw/di`.

---

## Контейнер и взаимодействия

Net получает `sendSignal` от Core и регистрирует `onSignal` для Rtc. При поступлении `offer`, `answer` или `candidate` Net передаёт их `Rtc`, сохраняя `sessionId` в заголовках (`payload.sessionId`). Повторные сообщения по одному `sessionId` также логируются, чтобы можно было отслеживать переотправки.

---

## Связи

- `ctx/rules/web/app.md` — `call`-поток запускает сигналинг.
- `ctx/rules/web/contours/core.md` — `Net` получает `sessionId` и команды `sendOffer`/`sendAnswer`/`sendCandidate`.
- `ctx/rules/web/contours/rtc.md` — `Rtc` получает сигналы и отвечает.
- `ctx/rules/web/infra/ws.md` — формат WebSocket-сообщений.
- `ctx/rules/web/contours/shared.md` — логирование и утилиты.

---

## Итог

Net обеспечивает прямой обмен сигналами по `sessionId` без событийных шин, списков или комнат. Все входящие и исходящие сообщения фиксируются через DI и передаются Rtc напрямую.
