# Контур Media и управление устройствами

Этот документ описывает контур **Media**, являющийся частью браузерного приложения ДомоЗвон, определённого в `app.md`.

## Назначение

Media отвечает за доступ к камерам, микрофонам, микширование потоков и передачу состояния устройств остальным контурам. Контур фиксирует, какие устройства доступны, когда их включать и как сообщать об ошибках, не раскрывая бизнес-логику.

## Границы и интерфейсы

- **Входные сигналы**: `env:ready` (`Env` подтверждает список разрешённых устройств), `core:state` (Core включает/выключает медиапотоки), `ui:permission-request` (Ui просит повторно запросить разрешения).
- **Выходные события**: `media:state`, `media:ready`, `media:error`, `media:devicechange` через `Shared.EventBus`; `media:stream` (коллбэки) для Rtc; сигналы `media:mute`/`media:unmute` для Ui/Net.
- **Коллбэки**: внутренние обработчики `onDeviceGranted`, `onDeviceRevoked` для синхронного контролирования устройств, без вызова EventBus.

## Типичные DI-зависимости

- `HomeCall_Web_Media_DeviceManager$`
- `HomeCall_Web_Media_SignalRouter$`
- `HomeCall_Web_Media_Constraints$`
- `HomeCall_Web_Rtc_PeerFactory$` (передача потоков)
- `HomeCall_Web_Env_Provider$`
- `HomeCall_Web_Shared_EventBus$`
- `HomeCall_Web_Shared_Logger$`

## Контейнер и взаимодействия

Media разворачивается через `@teqfw/di` и не инициализирует напрямую UI, Net или Core. Контейнер обеспечивает позднее связывание: браузерная сборка получает реальный `DeviceManager`, тесты подставляют `MockDeviceManager`, агенты подменяют `Env.Provider`. EventBus служит проводником сообщений `media:*`, а весь поток состояний контролируется через зарегистрированные в контейнере коллбэки `HomeCall_Web_Media_*`.

## Связи

- `ctx/rules/web/app.md` — моменты запроса и освобождения устройств в сценариях приложения.
- `ctx/rules/web/contours/env.md` — разрешения и специфика платформы.
- `ctx/rules/web/contours/rtc.md` — передача треков и управление `RTCPeerConnection`.
- `ctx/rules/web/contours/ui.md` — виджет уведомлений о состоянии устройств.
- `ctx/rules/web/contours/shared.md` — EventBus и логгер.

## Итог

Контур Media обеспечивает управление устройствами в рамках сценариев `app.md`, информируя остальные контуры об изменениях.  
См. также `app.md` — обзорный документ браузерного приложения ДомоЗвон.
