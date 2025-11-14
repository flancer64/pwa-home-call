# Контур Ui и экранная логика

Этот документ описывает контур **Ui**, реализующий путь `home → invite → call → end` без toolbar, панелей или EventBus.

## Назначение

Ui получает команды от Core и переводит их в конкретные состояния. Все пользовательские действия (`onCallRequest`, `onEndRequest`, `onNameUpdate`) передаются обратно в Core через DI-коллбэки, а статусы и ошибки выводятся исключительно через `toast`.

---

## Границы и интерфейсы

- **Входные команды**: `Ui.showHome(params)`, `Ui.showInvite(params)`, `Ui.showCall(stream, callbacks)`, `Ui.showEnd(connectionMessage)`.
- **Обратные коллбэки**: `onCallRequest`, `onStartCall`, `onCopyLink`, `onShareLink`, `onEndRequest`, `onReturn`, `onNameUpdate`.
- **Состояния**:
- `home` — имя вводится один раз; кнопка **«Позвонить»** вызывает `onCallRequest`; новые кнопки **«Изменить имя»** / **«Сбросить настройки»** очищают хранилище и возвращают форму, а входящее сообщение говорит «Вас пригласили в комнату …».
- `invite` — отображает ссылку, кнопки **«Скопировать ссылку»** / **«Поделиться»**, и вызывает `onStartCall`;
- `call` — показывает `remoteStream`, `#local-miniature`, и кнопку **«Завершить звонок»**; в дополнение к `toast`, индикаторы камеры/микрофона и кнопка **«Повторить»** показывают состояние `MediaManager`.
  - `end` — один итоговый экран с кнопкой **«Вернуться на главную»**.

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
