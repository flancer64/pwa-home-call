# Компонент `screen-card`

Путь: `ctx/docs/composition/client/ui/components/screen-card.md`

## Назначение

`screen-card` — карточка, которая несёт трёхзонный скелет (`header`, `main`, `footer`), применяемый на `ready`, `waiting` и `ended`, чтобы сохранять единые отступы, ширину и глубину.

## Структура

- `slot="header"` — встраивает `screen-header` или другой заголовок.
- `slot="main"` — центрирует `big-button` и overlay`ы вроде шаринга.
- `slot="footer"` — отведён под `screen-note`, который ограничивается одной-двумя строками.

## Гарантии layout’а

1. Карточка растягивается на всю высоту вьюпорта, ограничивает ширину (≈640 px) и центрируется по горизонтали.
2. `main` остаётся центрированным при любых размерах контента; `footer` привязан к нижнему краю.
3. Дополнения (кроме фона и радиуса) не применяются, чтобы карточка оставалась прозрачной к содержимому.
4. Safe-area-инвариант не повторяется здесь: карточка наследует оболочку, описанную в `ctx/docs/composition/client/ui/layout/skeleton.md`, которая применяет `env(safe-area-inset-*)` к `screen-shell` и `screen-card`.

## Примечания

- Карточка не управляет поведением; экраны решают, какие компоненты размещаются в слотах.
- Она использует палитру `ctx/docs/composition/client/ui/patterns/style.md`, а `ctx/docs/composition/client/ui/components/style.md` уточняет атомные состояния наряду со `screen-header`, `screen-note`, `big-button`.
