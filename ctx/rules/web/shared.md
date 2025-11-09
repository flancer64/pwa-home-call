# Контур Shared — инфраструктура (`ctx/rules/web/shared.md`)

## Назначение

Shared содержит общие сервисы, которыми пользуются все контуры: `EventBus`, `Logger`, утилиты и кэшированные помощники. Он не содержит доменной логики, но фиксирует координаты событий, трассировки и вспомогательных операций.

## Границы и интерфейсы

| Компонент | Назначение | Интерфейс |
| --- | --- | --- |
| `EventBus` | Единая шина событий `core`, `ui`, `media`, `rtc`, `net`, `env` | `emit(event, payload)`, `on(event, handler)`, `once`, `off` |
| `Logger` | Унифицированный лог для всех контуров и среды | `debug`, `info`, `warn`, `error`, поддержка `context` |
| `Util` | Преобразователи, генераторы идентификаторов, `storage`-обёртки | Синхронные утилиты (`uuid`, `storage.get/set`) |

EventBus передаёт события `shared:*`, `core:*`, `ui:*`, `media:*`, `rtc:*`, `net:*`, `env:*`. Logger оборачивает события и ошибки, Util выступает вспомогательным слоем без побочных эффектов.

## Типичные DI-зависимости

- `HomeCall_Web_Shared_EventBus$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Shared_Util$`
- `HomeCall_Web_Shared_Config$`

## Контейнер и взаимодействия

Shared регистрируется в `@teqfw/di` как центральный узел: контуры получают `EventBus`, `Logger`, `Util` только через контейнер. Все коллбэки, подписки и публикации строятся на этих сервисах, исключая прямые обращения. Позднее связывание позволяет тестам подменять шину на фиктивную реализацию и контролировать логирование.

## Связи

- `ctx/rules/web/core.md` — Core публикует `core:*` события на EventBus.
- `ctx/rules/web/net.md`, `ctx/rules/web/media.md`, `ctx/rules/web/rtc.md`, `ctx/rules/web/ui.md`, `ctx/rules/web/env.md` — все подписываются на `Shared.EventBus`.
- `ctx/rules/web/ws.md` — EventBus транслирует сообщения Net в локальные события.
