# Подсистема макетов

Путь: `ctx/docs/composition/client/ui/layout/AGENTS.md`

## Назначение

Каталог фиксирует макеты клиента: трёхзонный skeleton, call-макет, overlays и прикладные связи с визуальными паттернами. Этот файл выполняет функцию точки входа уровня вместо прежнего `overview.md`, связывая layout-документы, safe-area-инварианты и обмен элементами без дублирования информации.

## Карта уровня

- `overlays/` — наложения (например, share-link), которые появляются поверх skeleton и не перестраивают зоны.
- `AGENTS.md` — настоящий документ; описывает структуру, safe-area-инварианты уровня layout`ов и их связи.
- `call.md` — макет `active`, в котором видеофон и FAB-контролы располагаются в отдельных слоях, пересылающих сигналы к overlay`ам и toast-layer.
- `skeleton.md` — трёхзонный skeleton `screen-card`, который единственный применяет safe-area padding (`screen-card--skeleton`, `max(env(safe-area-inset-*), 16px)`) для состояний `ready`, `waiting` и `ended`.

## Структура макетов

- `skeleton.md` описывает три зоны (`header`, `action`, `footer`) и подробно фиксирует safe-area padding (`max(env(safe-area-inset-*), 16px)`) внутри `screen-card--skeleton`, который единственный заботится о сохранении текста и CTA в безопасном расстоянии от вырезов.
- `call.md` формирует edge-to-edge `active` макет: видео и фон растягиваются на весь viewport без padding’ов, а safe-area применяется лишь к плавающим слоям (`call-controls`, `call-local`, toast-layer), которые используют `env(safe-area-inset-*)` для позиции.
- `overlays/` содержит наложения, которые располагаются над skeleton и call, наследуя безопасные отступы skeleton`а и не вводя новых layout-инвариантов.

## Safe-area

- `skeleton.md` — единственное место, где описывается формула `max(env(safe-area-inset-*), 16px)`; safe-area padding закреплён за skeleton-кадрированием и сохраняет текстовые зоны `ready`, `waiting` и `ended` от вырезов.
- `call.md` остаётся edge-to-edge: видео и фон не получают padding, а safe-area используется исключительно для позиционирования плавающих слоёв (`call-controls`, `call-local`, toast-layer`), которые интегрируют `env(safe-area-inset-*)` в координаты `bottom`/`top`/`right`.
- `overlays/` повторно применяют skeleton`ные отступы, когда нужно сохранить безопасные границы, и не создают новых safe-area-инвариантов.

## Связи

- `ctx/docs/composition/client/states/states.md` ориентируется на skeleton и overlays, чтобы сопоставить состояния `ready` / `active` / `ended` с конкретными зонами и тостовым слоем.
- `ctx/docs/composition/client/ui/components/` — визуальные атомы (`screen-card`, `screen-header`, `big-button`, `screen-note`), применяемые в skeleton и call без повторения палитры из `ctx/docs/composition/client/ui/patterns/style.md`.
- `ctx/docs/composition/client/ui/patterns/toast-layer.md` размещает уведомления вне `screen-card`, обеспечивая, что layout`ы остаются свободными от текстовых черновиков и оставляют место для overlay`ов.

## Визуальные границы

- `ctx/docs/composition/client/ui/patterns/style.md` задаёт палитру, тени и типографику; layout`ы не переопределяют эти свойства и фокусируются на зонах и safe-area-инвариантах.
- Макеты описывают расположение зон и взаимосвязи между skeleton, call и overlay`ами, не повторяя состояния (см. `ctx/docs/composition/client/states/`).
