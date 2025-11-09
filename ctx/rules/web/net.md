# Контур Net и сигналинг

Этот документ описывает контур **Net**, являющийся частью браузерного приложения HomeCall, определённого в `app.md`.

## Назначение

Net обеспечивает событийный обмен с сервером сигналинга и распространяет состояния сети внутри фронтенда: он переводит WebSocket-сообщения в `Shared.EventBus` события и наоборот, сохраняя изоляцию от бизнес-логики и не работая напрямую с UI или Media.

## Границы и интерфейсы

- **WebSocket-протокол**: единое соединение `wss://<host>/signal` через `HomeCall_Web_Net_SignalClient$`; сообщения (JSON) имеют типы: `offer`, `answer`, `candidate`, `online`, `join`, `leave`, `error`.
- **Входные события**: `shared:ready`, `core:state` (для изменения комнаты), `media:error` (для переподключения), `env:change` (для обновления URL).
- **Выходные события**: `net:signal` (SDP/ICE), `net:online` (список пользователей), `net:error`, `net:disconnect`, `net:ready` через `Shared.EventBus`; внутренние коллбэки `onmessage`, `onopen`, `onclose`.
- **Событийная маршрутизация**: все `net:*` события публикуются на `Shared.EventBus`, и Core, Ui, Rtc подписываются без прямой связи с клиентом WebSocket.

## Типичные DI-зависимости

- `HomeCall_Web_Net_SignalClient$`
- `HomeCall_Web_Net_EventTranslator$`
- `HomeCall_Web_Net_NetworkState$`
- `HomeCall_Web_Shared_EventBus$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Env_Provider$`

## Контейнер и взаимодействия

Net разворачивается через `@teqfw/di` и получает `Shared.EventBus`, `Env`, `Logger` из контейнера. Он публикует события `net:*` исключительно через зарегистрированные сервисы и не импортирует UI или Core. Позднее связывание даёт возможность тестам подставлять `MockSignalClient` и подменять URL, а Codex-агенты формируют окружение, регистрируя нужные зависимости в `@teqfw/di`.

## Связи

- `ctx/rules/web/app.md` — сигналы сети на этапе `call` и переходы между состояниями.
- `ctx/rules/web/core.md` — сигналы о готовности и команды на смену комнаты.
- `ctx/rules/web/rtc.md` — `net:signal` для обмена SDP/ICE.
- `ctx/rules/web/ui.md` — `net:online` для обновления списка собеседников.
- `ctx/rules/web/shared.md` — EventBus и логгер.
- `ctx/rules/web/ws.md` — подробное описание JSON-сообщений.

## Итог

Контур Net поддерживает сетевую часть сценариев `app.md`, переводя WebSocket-сообщения в события приложения.  
См. также `app.md` — обзорный документ браузерного приложения HomeCall.
