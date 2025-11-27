# End Screen

**Path:** ./ctx/rules/web/ui/screens/end.md

## Purpose

Слабый финальный экран, где `component/big-button` возвращает пользователя на `home`, а `component/screen-note` даёт короткий статус. `component/screen-card` фиксирует структуру, `component/screen-header` сообщает об окончании звонка.

## Zones

- **Header** — `component/screen-header` с текстом «Звонок завершён».
- **Action** — `component/big-button` **«Вернуться на главную»**; переход описывается только в `screens.md`.
- **Hint** — `component/screen-note` с коротким контекстом («Тапните ещё раз, чтобы начать новый сеанс»), появляется только для подтверждения.

## Requirements

- Все текстовые статусы отображаются в hint и дополнительно через `notifications.md`; экран не содержит логики обработки ошибок (они приходят до загрузки).
- Кнопка оставляет `sessionId` пустым и вызывает переходы, описанные в `screens.md`.
- Стиль, контекст и ритм определяются в `component` и `style`; документ описывает только размещение `component/big-button` и `component/screen-note`.
