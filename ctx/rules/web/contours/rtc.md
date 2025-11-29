# Контур Rtc и WebRTC

Этот документ описывает контур **Rtc**, управляющий `RTCPeerConnection` и передачей аудио/видео между участниками.

## Назначение

Rtc создаёт и сопровождает WebRTC-соединение, получая `localStream` от Media, `signal` от Net и сообщая `remoteStream`/состояние обратно через коллбэки. Все взаимодействия происходят через DI и прямые вызовы (`onIceCandidate`, `onConnectionStateChange`), без событийной шины.

> **Согласованность с продуктом:** `ctx/product/capabilities/connection.md` говорит, что `Rtc` работает в состоянии `active` внутри одного окна, поэтому `Rtc` обслуживает только текущую сессию, не создавая новых экранов или комнат, а `ctx/agent/plan/2025/11/20251129-rules-implementation-fixes.md` описывает дальнейшую привязку state machine к этим вызовам.

---

## Границы и интерфейсы

- **Входные данные**:
  - `localStream` от Media;
  - `signal` (offer/answer/candidate) от Net через `onSignal`;
  - команды `startOutgoingSession(sessionId)`, `startIncomingSession(sessionId)`, `endSession()` от Core;
- **Выходные коллбэки**:
  - `onRemoteStream(remoteStream)` для UI;
  - `onConnectionState(state)` для Core (сообщает `connecting`, `connected`, `disconnected` — далее `Core` решает, показывать `toast` или переключаться на `end`).
  - `onIceCandidate(candidate)` для Net;

Rtc не публикует `rtc:*` события; вся логика встроена в методы и callback-объекты, переданные через контейнер.

---

## Типичные DI-зависимости

- `HomeCall_Web_Rtc_PeerFactory$`
- `HomeCall_Web_Media_DeviceManager$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Shared_Util$`
- `HomeCall_Web_Net_EventTranslator$`

---

## Контейнер и взаимодействия

Rtc разворачивается через `@teqfw/di`. `Core` регистрирует коллбэки `onRemoteStream`, `onConnectionState`, `onIceCandidate`, `startOutgoingSession` и `startIncomingSession`, а `Net` получает `onIceCandidate` и `sendSignal`. При поступлении сигналов Rtc вызывает `onConnectionState` напрямую, и Core обновляет `Ui` через `toast`.

---

## Связи

- `ctx/rules/web/app.md` — сценарий `call` и жизненный цикл соединения.
- `ctx/rules/web/contours/media.md` — источник `localStream`.
- `ctx/rules/web/contours/net.md` — выходящие и входящие сигналы.
- `ctx/rules/web/contours/core.md` — Core управляет началом/концом сессии.
- `ctx/rules/web/contours/shared.md` — логгер фиксирует состояния соединения.

---

## Итог

Контур Rtc обслуживает WebRTC без EventBus: все сигналы проходят через DI-коллбэки, а Core решает, надо ли уведомлять пользователя `toast`, переключаться на `end` и обновлять `sessionId`.
