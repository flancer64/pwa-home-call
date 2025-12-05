# Наложение «Ссылка для соединения»

Путь: `ctx/composition/client/ui/layout/overlays/share-link.md`

## Назначение

Описывает визуальный слой, который активируется в `waiting` и плавает над трёхзонным скелетом, сохраняя зоны `action` и `Footer` без перестроений. Наложение содержит ссылку, управляющие кнопки и вспомогательные подсказки.

## Компоновка

- Заголовок повторно использует `screen-header` с текстом «Ссылка для соединения» и размещает `header-action-button` в слоте действий для закрытия наложения.
- Основная зона выводит URL приглашения (`waiting-link`) и две `big-button`: одна инициирует шаринг, другая копирует ссылку; кнопки оформлены через `tone="secondary"`/`tone="ghost"` и могут содержать иконки через `icon-wrapper`.
- Footer-зона содержит короткий `screen-note`, объясняющий, как поделиться ссылкой, не дублируя тосты; подтверждения и ошибки показываются через `toast-layer`.

## Контракт адреса

- Ссылка генерируется как `https://<host>/?session=<uuid>` без дополнительных параметров и остаётся фиксированной на протяжении одного звонка.
- `sessionId` нигде больше не отражается, чтобы избежать рассинхронизации, а сам URL остаётся видимым, пока активен overlay.

## Связи

- `ctx/composition/client/ui/layout/skeleton.md` — наложение помещается над скелетом и не перестраивает его зоны.
- `ctx/composition/client/ui/components/big-button.md`, `ctx/composition/client/ui/components/screen-header.md`, `ctx/composition/client/ui/components/screen-note.md` — визуальные атомы, обеспечивающие контролы и текст наложения.
- `ctx/composition/client/ui/patterns/toast-layer.md` — статусы и ошибки, связанные с шарингом, выходят через тосты, а не через `screen-note`.
- `ctx/composition/client/states/share-link.md` — состояние `waiting` привязывается к этому наложению.
- `ctx/composition/client/ui/patterns/style.md` — тема, которой придерживается overlay, чтобы цвета и тени не отличались от основного интерфейса.
