# Domozvon screen contour

**Path:** ./ctx/rules/web/ui/screens.md

The app now follows a consistent `home → invite → call → end` flow with only one highlighted action per screen. All transitions rely on the DI-controlled UI controller; there is no routing or toolbar.

## Purpose
The contour ensures that every screen keeps the same typography, spacing, and focus on large CTA elements while also exposing the new invite step and richer media indicators.

## States
1. **home** – единственный интерфейс для запуска нового звонка с кнопкой **«Позвонить»** и подсказкой «Ссылка создаётся автоматически». Экран не хранит имена и не запрашивает данные. Если сессия уже передана через `?session=<uuid>`, `Core` вскоре переключается на `call`, а `home` показывает короткий статус «Подключение к сеансу…».
2. **invite** – появляется после генерации `sessionId`. Зона действий отображает ссылку, **«Скопировать ссылку»**, **«Поделиться»** (если `navigator.share` доступен) и **«Начать звонок»**, сохраняя привычную трёхзонную компоновку.
3. **call** – отводит экран под видео собеседника, показывает нижнюю панель с **«Завершить звонок»** и локальную миниатюру, а верхний оверлей выводит индикаторы состояния камеры/микрофона и кнопку **«Повторить»**, если разрешения заблокированы.
4. **end** – сообщает «Звонок завершён», подсказывает, что можно начать новый сеанс, и предлагает широкую кнопку **«Вернуться на главную»**, очищая `sessionId`.

## Transitions
- `home → invite`: triggered by **«Позвонить»**; Core генерирует `sessionId`, показывает ссылку и делает `invite` активным без дополнительных форм.
- `home → call`: если `Env` передал `session=<uuid>`, `Core` автоматически запускает подготовку и сразу показывает `call` после готовности медиа.
- `invite → call`: **«Начать звонок»** запускает `Media.prepare()`, `Net.startSignal(sessionId)`, `Rtc.startOutgoingSession(sessionId)` и отображает `call`.
- `call → end`: любое завершение соединения (ручное через **«Завершить звонок»** или сбой сети) останавливает медиа, закрывает сигналинг и показывает `end`.
- `end → home`: нажатие **«Вернуться на главную»** очищает `sessionId` и возвращает пользователя к одному CTA.

## Feedback
- Errors about media, signaling, or sharing appear as toast notifications; the screens remain clean with only the relevant CTA.
- The `call` overlay reflects the `MediaManager` status so the user sees whether the camera or microphone is **Готово**, **Приостановлено**, **Заблокировано** или **Не поддерживается**.
