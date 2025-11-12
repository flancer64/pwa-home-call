# Контур Rtc и WebRTC

Этот документ описывает контур **Rtc**, являющийся частью браузерного приложения ДомоЗвон, определённого в `app.md`.

## Назначение

Rtc организует создание и сопровождение `RTCPeerConnection`, обменивается SDP/ICE через Net, получает медиапотоки от Media и сообщает о состоянии каналов другим контурам. Контур описывает жизненный цикл соединений, реакции на статус сигналинга и закрытие потоков.

## Границы и интерфейсы

- **Входные сигналы**: `net:signal` (получение SDP/ICE), `media:stream` (локальные дорожки), `core:state` (инициация/завершение сессии), `shared:shutdown`.
- **Выходные события**: `rtc:connected`, `rtc:disconnected`, `rtc:error`, `rtc:track` через `Shared.EventBus`; вызовы коллбэков `onIceCandidate`, `onNegotiationNeeded` для Net; `media:sync` при необходимости переключить устройства.
- **Протокол обмена**: Rtc делегирует передачу сигналов `net:signal` событиям Net, создаёт `offer/answer` и регистрирует полученные кандидаты через объекты `HomeCall_Web_Rtc_Peer$`.

## Типичные DI-зависимости

- `HomeCall_Web_Rtc_Peer$`
- `HomeCall_Web_Rtc_PeerFactory$`
- `HomeCall_Web_Shared_EventBus$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Media_DeviceManager$`
- `HomeCall_Web_Net_EventTranslator$`

## Контейнер и взаимодействия

Rtc разворачивается через `@teqfw/di`, и все объекты получают контексты через контейнер. Контур не импортирует Media или Net напрямую: `Media` предоставляет `media:stream`, `Net` — `net:signal`, а Rtc отвечает собственными коллбэками, зарегистрированными через DI-обёртки. Позднее связывание позволяет тестам подставлять фиктивные RTCPeerConnection через `HomeCall_Web_Rtc_PeerFactory$` и проверять реакции на `net:signal`.

## Связи

- `ctx/rules/web/app.md` — настройка WebRTC в сценарии `call`.
- `ctx/rules/web/contours/media.md` — источник медиапотоков (`media:stream`, `media:state`).
- `ctx/rules/web/contours/net.md` — сигналинг и события `net:signal`.
- `ctx/rules/web/contours/core.md` — управление стартом/стопом вызовов.
- `ctx/rules/web/contours/shared.md` — EventBus и логгер для уведомлений о состоянии соединений.

## Итог

Контур Rtc поддерживает соединения и треки, описанные в сценарии `call` из `app.md`, без привязки к конкретной реализации.  
См. также `app.md` — обзорный документ браузерного приложения ДомоЗвон.
