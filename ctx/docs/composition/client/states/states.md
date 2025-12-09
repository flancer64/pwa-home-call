# Декларативные UI-состояния

Путь: `ctx/docs/composition/client/states/states.md`

## Назначение

Документ сопоставляет фрагменты `ready`, `waiting`, `active` и `ended` с layout-документами и визуальными атомами, не рассказывая о переходах между состояниями.

## Фрагмент `ready`

- Использует `ctx/docs/composition/client/ui/layout/skeleton.md` и `screen-card`, чтобы закрепить `screen-header`, один доминирующий `big-button` и `screen-note`.
- Заголовок выводит текст `Связист` и слот действий для `header-action-button`, action-зона содержит CTA `Связать` и опциональные вторичные `big-button`.
- Footer-зона показывает `screen-note` с поддерживающим текстом; статусы показываются через `ctx/docs/composition/client/ui/patterns/toast-layer.md`.

## Фрагмент `waiting`

- Применяет тот же скелет, но над ним активируется `ctx/docs/composition/client/ui/layout/overlays/share-link.md`.
- Overlay выводит приглашение, две `big-button` и подсказку, оставаясь поверх `screen-card` и не перестраивая зоны.
- `screen-note` ограничивается одной строкой и не дублирует тосты; ошибки и подтверждения снова распределяются по `toast-layer`.

## Фрагмент `active`

- Прерывает скелет: layout определяется `ctx/docs/composition/client/ui/layout/call.md`, который кладёт `remoteStream` на фон, `localStream` и `ctx/docs/composition/client/ui/patterns/fab-panel.md` над медиапотоком.
- Статусы, включая подтверждения о подключении или потере сигналинга, появляются только через `toast-layer`, чтобы макет оставался чистым.
- Overlay`ы `settings` и `share-link` могут повторно использовать FAB-панель, не меняя call-layout.

## Фрагмент `ended`

- Возвращается `screen-card` из скелета; `screen-header` показывает `Звонок завершён`, а action-зона содержит одну `big-button` «Вернуться на главную».
- Footer-зона повторяет сообщение завершения; тосты продолжают обслуживать системные статусы.

## Примечания

- Все фрагменты используют палитру и отступы `ctx/docs/composition/client/ui/components/style.md`.
- Overlay`ы шаринга и настроек остаются декларативными, поэтому layout описан отдельно `ctx/docs/composition/client/ui/layout/overlays/share-link.md`.
