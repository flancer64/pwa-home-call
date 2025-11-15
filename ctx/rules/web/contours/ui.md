# Контур Ui и экранная логика

Этот документ описывает контур **Ui**, реализующий путь `home → invite → call → end` без toolbar, панелей или EventBus.

## Назначение

Ui получает команды от Core и отображает экраны `home`, `invite`, `call`, `end` без EventBus. Все действия пользователя (`onCallRequest`, `onStartCall`, `onCopyLink`, `onShareLink`, `onEndRequest`, `onReturn`) передаются обратно через DI-коллбэки, а статусы и ошибки показываются через `toast`.

---

## Границы и интерфейсы

- **Входные команды**: `Ui.showHome(params)`, `Ui.showInvite(params)`, `Ui.showCall(stream, callbacks)`, `Ui.showEnd(connectionMessage)`.
- **Обратные коллбэки**: `onCallRequest`, `onStartCall`, `onCopyLink`, `onShareLink`, `onEndRequest`, `onReturn`.
- **Состояния**:
- `home` — одна кнопка **«Позвонить»**, короткий совет «Ссылка создаётся автоматически» и никаких форм; при наличии `session` из URL `Core` автоматически переключает UI в `call`.
- `invite` — отображает ссылку, кнопки **«Скопировать ссылку»**, **«Поделиться»** (если Share API доступен) и вызывает `onStartCall`.
- `call` — показывает `remoteStream`, `#local-miniature`, индикаторы камеры/микрофона, кнопку **«Завершить звонок»** и, при необходимости, **«Повторить»** для повторных запросов разрешений.
- `end` — один итоговый экран с кнопкой **«Вернуться на главную»**, очищающей `sessionId`.

Все `toast`-сообщения (готовность ссылки, ошибки меди/связи) формируются Core или `share-link` и показываются через `Ui.showToast(message)` без встроенных текстов под кнопками или над миниатюрой.

---

## Типичные DI-зависимости

- `HomeCall_Web_Ui_ScreenFactory$`
- `HomeCall_Web_Ui_Renderer$`
- `HomeCall_Web_Ui_InputHandler$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Shared_ToastFactory$`

---

## Контейнер и взаимодействия

Ui разрешается через `@teqfw/di`. Core передаёт `callbacks` при переходе между экранами, а `Ui` вызывает их напрямую при действиях пользователя. Нет EventBus-подписок — всё работает через переданные интерфейсы и явные вызовы.

---

## Связи

- `ctx/rules/web/app.md` — состояния `home → invite → call → end`.
- `ctx/rules/web/ui/home.md`, `share-link.md`, `screens/call.md`, `screens/end.md` — конкретные шаблоны и описания экранов.
- `ctx/rules/web/contours/core.md` — Core управляет переходами и `toast`.
- `ctx/rules/web/contours/media.md` — `Ui` отображает `localStream` и миниатюру без статусов.
- `ctx/product/features/invite.md` — подтверждает, что ссылка создаётся автоматически.

---

## Итог

Контур Ui остаётся минимальным: `home`, `invite`, `call`, `end` управляются через DI и не требуют EventBus. Статусы появляются через `toast`, а медиа-индикаторы отображают состояние локальных устройств прямо на `call`.
