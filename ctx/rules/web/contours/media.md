# Контур Media и управление устройствами

Этот документ описывает контур **Media**, ответственный за доступ к камерам/микрофонам и передачу потоков другим контурам без событийной шины.

## Назначение

Media предоставляет API для инициализации устройств, переключения потоков и сообщениях об ошибках через напрямую переданные коллбэки (`onDevicesReady`, `onMediaError`, `onStream`) из контейнера DI.

---

## Границы и интерфейсы

- **Входные вызовы**:
  - `Core.startMedia()` / `Core.stopMedia()` — запуск и остановка потоков;
  - `Env` — проверка доступности устройств и разрешений;
  - `Ui` — команды-подтверждения (например, `confirmCameraAccess`).
- **Выход**:
  - `onStream(localStream)` передаёт `localStream` в `Rtc` и `Ui`;
  - `onDevicesReady()` уведомляет `Core`, что можно обновить состояние;
  - `onMediaError(error)` используется `Core`/`Ui` для показа `toast.error(...)`.

Media не публикует `media:*` события — вместо этого он вызывается через методы, полученные из DI.

---

## Типичные DI-зависимости

- `HomeCall_Web_Media_DeviceManager$`
- `HomeCall_Web_Media_Constraints$`
- `HomeCall_Web_Media_StreamFactory$`
- `HomeCall_Web_Rtc_PeerFactory$`
- `HomeCall_Web_Env_Provider$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Shared_Util$`

---

## Контейнер и взаимодействия

Media разворачивается через `@teqfw/di`. Любые коллбэки (`onStream`, `onMediaError`) передаются в момент регистрации (`Media.registerCallbacks(...)`) и затем вызываются напрямую. Тесты подставляют `MockDeviceManager`, а браузерные сборки — реальные устройства. Нет EventBus — только DI и вызовы коллбэков.

---

## Связи

- `ctx/rules/web/app.md` — запуск и остановка устройств во время `home`, `call`, `end`.
- `ctx/rules/web/contours/rtc.md` — `localStream` передаётся в RTCPeerConnection.
- `ctx/rules/web/contours/core.md` — Core реагирует на `onDevicesReady`/`onMediaError` и вызывает `toast`.
- `ctx/rules/web/contours/shared.md` — логгер фиксирует ошибки и события устройств.

---

## Итог

Контур Media управляет устройствами через DI-коллбэки, не прибегая к глобальной шине событий. Любая ошибка сразу передаётся в `Core`/`Ui` для отображения через `toast`, а `localStream` отдаются `Rtc` напрямую.
