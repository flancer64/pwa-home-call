# Контур Core и оркестрация

Этот документ описывает контур **Core**, отвечающий за последовательное прохождение сценария звонка, создание `sessionId` и координацию UI, медиа и сети.

> **Согласованность с продуктом:** `ctx/product/overview.md` вместе с `ctx/product/capabilities/connection.md` описывает единую state machine `ready → waiting → active`, ответственность за которую лежит на Core. Документ фиксирует текущую модель `home → invite → call → end` (Real code is still tied to these screens), но future plan `ctx/agent/plan/2025/11/20251129-rules-implementation-fixes.md` покажет, как вызываемые здесь методы будут переименованы и переработаны.

## Назначение

`HomeCall_Web_Core_App$` управляет жизненным циклом `home → invite → call → end`, генерацией `sessionId`, показом `invite` с ссылкой `/?session=<uuid>` и началом WebRTC без ввода имен или управления комнатами.

---

## Границы и интерфейсы

- **Входные воздействия**
-  - `Ui`: `onCallRequest`, `onStartCall`, `onEndRequest` (далее `Ui` выдаёт события без передачи `name` или иных пользовательских идентификаторов);
  - `Env`: `getContext()` и `onChange()` с полем `session` из URL;
  - `Net`: `handleSignal(payload)` и `onDisconnect()`;
  - `Media`: `onDevicesReady()`, `onMediaError()`, `onMediaStatus()` (состояния `{ready, blocked, error}`).
- **Выходные эффекты**
  - `Ui`: `showHome()`, `showInvite(sessionId)`, `showCall(connectionMessage)`, `showEnd(connectionMessage)`; `toast`-обратная связь;
  - `Net`: `startSignal(sessionId)`, `stopSignal()`;
  - `Media`: `prepare()`/`stopMedia()`;
  - `Rtc`: `startOutgoingSession(sessionId)`, `startIncomingSession(sessionId)`, `stopSession()`;
  - `share-link`: `generateShareLink(sessionId)`.

Core не использует `Shared.EventBus` — все коллбэки регистрируются через DI и вызываются напрямую.

---

## Оркестрационные сценарии

### Основной поток

1. UI вызывает `onCallRequest()` → `Core` генерирует новый `sessionId`, вызывает `share-link.generateShareLink(sessionId)` и отображает `Ui.showInvite(sessionId)` с автоматически готовой ссылкой.
2. После нажатия **«Связать»** invite вызывает `onStartCall()`; `Core` выполняет `Media.prepare()`, `Net.startSignal(sessionId)` и `Rtc.startOutgoingSession(sessionId)`, а затем показывает `Ui.showCall(connectionMessage)`.
3. `Net` доставляет `offer`/`answer`/`candidate`, `Rtc` сообщает о состоянии соединения, а `Core` транслирует статусы через `Ui.showCall()` и `toast` (названия `Готово`, `Повторить`, `Связь потеряна`).

### Входящий сеанс

1. `Env` читает параметр `?session=<uuid>` и передаёт его Core через `getContext()`; если он есть, `Core` сразу вызывает `share-link.generateShareLink(sessionId)` (чтобы ссылку можно было снова показать) и переходит к подготовке `call`.
2. `Core` инициирует `Media.prepare()`, `Net.startSignal(sessionId)` и `Rtc.startIncomingSession(sessionId)`, а затем, когда устройства готовы, показывает `Ui.showCall(connectionMessage)`. Экран `invite` может быть пропущен, так как ссылка уже активна и пользователь сразу подключается.

### Завершение и сброс

1. При `onEndRequest()` или сетевом разрыве Core вызывает `Media.stopMedia()`, `Rtc.stopSession()`, `Net.stopSignal()`, очищает `sessionId` из состояния и показывает `Ui.showEnd(connectionMessage)`.
2. Возврат на `home` очищает предыдущий `sessionId` и сбрасывает `toast`, но не пытается повторно использовать идентификатор: никакие комнаты не сохраняются.

---

## State machine mapping

- `ready` — текущее состояние `home`, которое показывает одиночный CTA и запускает генерацию `sessionId`.
- `waiting` — состояние `invite`, которое удерживает ссылку и описывает действия `share-link` до начала медиапередачи.
- `active` — состояние `call`, когда `Media`, `Net` и `Rtc` работают над WebRTC, а UI остаётся в пределах одной вкладки.
- `ended` — состояние `end`, которое очищает `sessionId` и возвращает пользователя в `ready`.

Core сейчас реализует эти состояния через `showHome()`, `showInvite()`, `showCall()` и `showEnd()`. План `ctx/agent/plan/2025/11/20251129-rules-implementation-fixes.md` описывает, как методы будут переписаны в `showState(stateName)` с именами `ready/waiting/active/ended`.

---

## Типичные DI-зависимости

- `HomeCall_Web_Core_App$`
- `HomeCall_Web_Core_StateMachine$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Shared_Util$`
- `HomeCall_Web_Env_Provider$`
- `HomeCall_Web_Ui_Controller$`
- `HomeCall_Web_Net_SignalClient$`
- `HomeCall_Web_Media_DeviceManager$`
- `HomeCall_Web_ShareLink_Factory$`

Core получает эти зависимости через `@teqfw/di` и вызывает их методы напрямую.

---

## Итог

 Контур **Core** управляет последовательностью `home → invite → call → end`, генерирует и очищает `sessionId`, показывает ссылку и запускает WebRTC без ввода имени и без «комнат». Все состояния синхронизированы через тосты и `Ui`, а сигнальная логика построена на `sessionId`.
