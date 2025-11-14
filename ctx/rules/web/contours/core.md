# Контур Core и оркестрация

Этот документ описывает контур **Core**, отвечающий за координацию всех подсистем браузерного приложения ДомоЗвон, заданных в `app.md`.

## Назначение

`HomeCall_Web_Core_App$` управляет жизненным циклом `home → invite → call → end`, инициирует генерацию UUID-комнаты, формирует ссылку и передаёт явные команды `Ui`, `Media` и `Net`. Core не публикует события — взаимодействие идёт через DI-переданные коллбэки и сервисы, сохраняя предсказуемость.

---

## Границы и интерфейсы

- **Входные воздействия**
  - обратные вызовы из `Ui`: `onCallRequest`, `onEndRequest`, `onNameUpdate`;
  - вызовы от `Env.Provider`: `onEnvironmentChange`, `onPlatformReady`;
  - результат `Net`: `handleSignal`, `onDisconnect`;
  - статусы `Media`: `onDevicesReady`, `onMediaError`.
- **Выходные эффекты**
- вызовы `Ui`: `showHome()`, `showInvite()`, `showCall()`, `showEnd()` с проксированными `toast`-сообщениями;
  - команды `Net`: `startSignal(room)`, `stopSignal()`;
  - команды `Media`: `startMedia()`, `stopMedia()`;
  - вызов `share-link`: `generateShareLink(room)` и `toast`-обратная связь.

Core не использует `Shared.EventBus` — вместо этого он сохраняет ссылки на сервисы, регистрирует коллбэки в контейнере и вызывает их напрямую.

---

## Оркестрационные сценарии

### Основной поток

1. `Ui` вызывает `onCallRequest()` → Core генерирует UUID-комнату, формирует ссылку через `share-link`, вызывает `Ui.showInvite()` и показывает toast о готовности ссылки.
2. После нажатия **«Начать звонок»** invite вызывает `onStartCall()`; Core выполняет `Net.startSignal(room)`, `Media.prepare()` и `Ui.showCall()`, затем `peer.start()` запускает обмен предложениями.
3. При `onEndRequest()` или сетевом разрыве Core вызывает `Media.stopMedia()`, `Net.stopSignal()`, `Ui.showEnd(connectionMessage)` и ожидает `Ui.onReturn()`.

### Подключение по ссылке

`Env` передаёт URL-параметр `room` → Core сохраняет его как pending room, передаёт `room` `share-link`, и если имя уже сохранено, сразу вызывает `Ui.showCall()`; иначе `home` остаётся видимым с текстом «Вас пригласили в комнату <room>. Введите имя, чтобы присоединиться», и после ввода имени Core запускает `startIncomingCall(room)`.

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

Core получает эти зависимости из `@teqfw/di` и вызывает их методы напрямую, без захода на шины событий.

---

## Связи

- `ctx/rules/web/app.md` — сценарии `home`, `call`, `end`.
- `ctx/rules/web/ui/home.md`, `share-link.md`, `screens/call.md`, `screens/end.md` — экранные состояния и переходы.
- `ctx/rules/web/infra/storage.md` — хранение `name`.
- `ctx/rules/web/contours/media.md`, `net.md`, `env.md`, `shared.md` — дополнительные сервисы и логирование.
- `ctx/product/features/invite.md`, `ctx/product/scenarios/*` — продуктовые сценарии однокнопочного вызова.

---

## Итог

Контур **Core** управляет последовательностью `home → invite → call → end` без toolbar и EventBus. Он формирует и шлёт ссылку перед звонком, держит `toast`-статусы, отображает медиа-статусы в `call` и поддерживает автоподключение по ссылке через `share-link`.
