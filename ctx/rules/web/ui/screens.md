# Screens Map

**Path:** `./ctx/rules/web/ui/screens.md`

## Purpose

Сводит в одном месте состояния `home → invite → call → end`, фиксирует CTA (`component/big-button`) и триггеры переходов, а также отмечает ограничения на дополнительные действия. Документы в `screens/` описывают только содержание зон, компоненты (`component/screen-card`, `component/screen-header`, `component/screen-note`) и переходы содержатся здесь.

## States

1. **home** — бренд, обычный заголовок и `component/big-button` **«Связать»**; единственный CTA создаёт `sessionId` и инициирует переход к `invite`, настройки к FABу не привязаны.
2. **invite** — заголовок, ссылка и две `component/big-button`: основной (Share/Copy) и CTA **«Начать звонок»**; экран остаётся в рамках `component/screen-card`.
3. **call** — собственная компоновка: `remoteStream` занимает весь экран, `localStream` плавает в миниатюре правого верхнего угла, а внизу — две FAB-кнопки (завершение и настройки); статусы находятся только в тостах, `screen-card` тут не используется.
4. **end** — текст «Звонок завершён», `component/big-button` **«Вернуться на главную»**; `component/screen-note` добавляет короткий совет, экран не содержит FAB.

Все остальные экраны опираются на трёхзонную структуру `component/screen-card`, `layout.md` и стиль `style.md`. `call` единственный держит собственную layout-схему (см. `layout.md`).

## Transitions

- `home → invite` — `component/big-button` **«Связать»** вызывает `onCallRequest`, Core генерирует `sessionId`, запускает `share-link` и отображает `invite`; toast подтверждает готовность ссылки.
- `invite → call` — `component/big-button` **«Начать звонок»** вызывает `onStartCall`, Core берёт на себя подготовку медиа, signal и WebRTC, после чего UI отображает `call`; статусы идут через toast.
- `call → end` — красная FAB завершения (`onEndRequest`) вызывает переход, Core останавливает потоки и показывает `end`, toast сообщает о статусе соединения.
- `end → home` — CTA **«Вернуться на главную»** очищает `sessionId` и возвращает `home`; экран остаётся чистым, валидация состояния через toast (например, «Сессия завершена»).
- `settings` открывается как overlay поверх `call` и закрывается тем же действием; green FAB отвечает за его показ, и этот CTA не добавляет новых экранов.

## Status routing

Статусы медиа, разрешений и сигналинга показываются только через `toast` (`notifications.md`); `screen-note` служит только статичной справкой и не дублирует события. `call` и `invite` остаются без текстовых поверхностей.

## References

- `./layout.md` — общее расположение зон.
- `./style.md` — визуальные ограничения.
- `./share-link.md` — техника генерации и шаринга ссылки.
- `./component/` — визуальные атомы `screen-card`, `big-button`, `screen-header`, `screen-note`.
- `./screens/` — документы с уникальным содержанием каждого экрана.
