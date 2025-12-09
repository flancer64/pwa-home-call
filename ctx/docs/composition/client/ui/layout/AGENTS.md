# Подсистема макетов

Путь: `ctx/docs/composition/client/ui/layout/AGENTS.md`

## Назначение

Каталог фиксирует макеты клиента: трёхзонный skeleton, call-макет, overlays и прикладные связи с визуальными паттернами. Этот файл выполняет функцию точки входа уровня вместо прежнего `overview.md`, связывая layout-документы, safe-area-инварианты и обмен элементами без дублирования информации.

## Карта уровня

- `overlays/` — наложения (например, share-link), которые появляются поверх skeleton и не перестраивают зоны.
- `AGENTS.md` — настоящий документ; описывает структуру, safe-area-инварианты уровня layout`ов и их связи.
- `call.md` — макет `active`, в котором видеофон и FAB-контролы располагаются в отдельных слоях, пересылающих сигналы к overlay`ам и toast-layer.
- `skeleton.md` — трёхзонный skeleton `screen-card` с safe-area-aware оболочкой, которую используют состояния `ready`, `waiting` и `ended`.

## Структура макетов

- `skeleton.md` описывает три зоны (`header`, `action`, `footer`) в `screen-card`, гарантирует выравнивание и упоминает safe-area-инвариант (см. раздел Safe-area). Safe-area-aware `screen-shell` и `screen-card` задают минимальные отступы, которые наследуют все экраны на основе skeleton.
- `call.md` фиксирует уникальный `active` макет с видеофоновой сценой и FAB-контролами, которые встраиваются в safe-area-контейнеры skeleton, поэтому сами не описывают дополнительные insets.
- `overlays/` содержит наложения, которые располагаются над skeleton и call, используя тот же набор зон и safe-area-оболочек и не создавая новых layout-инвариантов.

## Safe-area

- Детали об использовании `env(safe-area-inset-*)` и минимальных отступов фиксирует `skeleton.md`; остальные документы (`call.md`, `overlays/*`) ссылаются на него и не дублируют расчёты.

## Связи

- `ctx/docs/composition/client/states/states.md` ориентируется на skeleton и overlays, чтобы сопоставить состояния `ready` / `active` / `ended` с конкретными зонами и тостовым слоем.
- `ctx/docs/composition/client/ui/components/` — визуальные атомы (`screen-card`, `screen-header`, `big-button`, `screen-note`), применяемые в skeleton и call без повторения палитры из `ctx/docs/composition/client/ui/patterns/style.md`.
- `ctx/docs/composition/client/ui/patterns/toast-layer.md` размещает уведомления вне `screen-card`, обеспечивая, что layout`ы остаются свободными от текстовых черновиков и оставляют место для overlay`ов.

## Визуальные границы

- `ctx/docs/composition/client/ui/patterns/style.md` задаёт палитру, тени и типографику; layout`ы не переопределяют эти свойства и фокусируются на зонах и safe-area-инвариантах.
- Макеты описывают расположение зон и взаимосвязи между skeleton, call и overlay`ами, не повторяя состояния (см. `ctx/docs/composition/client/states/`).
