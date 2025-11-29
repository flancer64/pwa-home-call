# End Screen

**Path:** ./ctx/rules/web/ui/screen/end.md

## Purpose

Слабый финальный экран, где `component/big-button` возвращает пользователя на `home`, а `component/screen-note` даёт короткий статус. `component/screen-card` фиксирует структуру, `component/screen-header` сообщает об окончании звонка.

> **Согласованность с продуктом:** `ctx/product/overview.md` подчёркивает: состояние завершения должно оставаться в том же окне. `end` документирует текущий финальный экран, а план `ctx/agent/plan/2025/11/20251129-rules-implementation-fixes.md` объясняет, как он будет трансформирован в состояние `ended` внутри single-window state machine.

## Zones

- **Header** — `component/screen-header` с текстом «Звонок завершён».
- **Main** — `component/big-button` **«Вернуться на главную»**; переход описывается только в `screens.md`.
- **Footer** — `component/screen-note` с коротким контекстом («Тапните ещё раз, чтобы начать новый сеанс»), появляется только для подтверждения.

## Requirements

- Все текстовые статусы отражаются в зоне `footer` и дополнительно через `notifications.md`; экран не содержит логики обработки ошибок (они приходят до загрузки).
- Кнопка оставляет `sessionId` пустым и вызывает переходы, описанные в `screens.md`.
- Стиль, контекст и ритм определяются в `component` и `style`; документ описывает только размещение `component/big-button` и `component/screen-note`.
