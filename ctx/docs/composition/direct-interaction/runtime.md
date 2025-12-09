# Выполнение direct-interaction

Путь: `ctx/docs/composition/direct-interaction/runtime.md`

## Назначение

Документ фиксирует фактическое поведение интерфейса direct-interaction: как видеопотоки и плавающие контролы удерживаются в DOM и какие визуальные состояния они принимают во время сеанса.

## Поведение

- **Удалённый поток** остаётся статической фоновкой (`<video id="remoteStream">` в `#call-view`), которая масштабируется по размеру окна без перестроения layout’а.
- **Локальная превью** закрепляется в отдельном контейнере и может менять позицию (углы или центр) без реконфигурации основной сцены.
- **Акустика.** `remoteStream` остаётся единственным источником звука, а локальная превью в контейнере muted, чтобы исключить реверберацию при прямом воспроизведении.
- **FAB-кнопки** сохраняют абсолютное позиционирование и remain focusable: их размеры и контраст задаются в `ctx/docs/composition/client/ui-elements/style.md`, а состояние «disabled» отображается визуально без переходов layout’а.
- **Overlay’ы и тосты** (share-link, settings, notifications) включаются поверх call view, не разрывая основной DOM: они просто меняют класс видимости, указанный в `ctx/docs/composition/client/ui-states/states.md`.

## Связь с другими артефактами

- media view описана в `ctx/docs/composition/direct-interaction/media-views.md`.
- Кнопки и palette — в `ctx/docs/composition/client/ui-elements/`.
