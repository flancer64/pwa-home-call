# Скелет layout’а браузерного UI

Путь: `ctx/docs/composition/client/ui/layout/skeleton.md`

## Назначение

Документ определяет трёхзонный скелет, который наследуют `ready`, `waiting` и `ended`: заголовок, action-зона с CTA и Footer-контейнер. Скелет остаётся декларативным и не описывает переключения между состояниями.

## Трёхзонный скелет

- **Header** — размещает `screen-header`, который выводит название и слот `action` для `header-action-button`.
- **Action** — центрирует один доминирующий `big-button`. Дополнительные действия появляются как вторичные `big-button` или иконки в слоте `screen-header`, не создавая новых зон.
- **Footer** — содержит `screen-note` с одной-двумя строками статичного текста (`tone` `neutral` или `whisper`). Он отделён от action-зоны и никогда не дублирует записи тостового слоя, но открыт для любых статичных сообщений, которые не повторяют уведомления из toast-layer.

## Карточка и стабилизация

- `screen-card` растягивается на высоту вьюпорта, центрирует контент и сохраняет отступы (см. `ctx/docs/composition/client/ui/components/screen-card.md`).
- Зоны складываются вертикально и не изменяют порядок; `action` остаётся фиксированным, а `header`/`footer` реагируют не поведением, а только текстом.

## Связи

- `ctx/docs/composition/client/ui/components/` — компоненты `screen-header`, `screen-note`, `big-button` и `screen-card` реализуют зоны в этом скелете.
- `ctx/docs/composition/client/ui/patterns/toast-layer.md` — тосты не находятся в `screen-card`, поэтому layout направляет статусы в отдельный паттерн.
- `ctx/docs/composition/client/ui/patterns/style.md` — палитра, типографика и глубина, которой придерживается skeleton без описания новых цветов или теней.
- `ctx/docs/composition/client/ui/layout/overlays/share-link.md` — overlay шаринга подключается к этому скелету, плавая над ним без перестраивания зон.
