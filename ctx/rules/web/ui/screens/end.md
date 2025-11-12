# End Screen

**Путь**: ./rules/web/ui/screens/end.md

## Назначение

Экран `end` подводит итог вызова: показывает причину выхода, демонстрирует успешное завершение и отправляет пользователя обратно в лобби, не забывая освободить медиаресурсы.

## Основные этапы взаимодействия

1. `HomeCall_Web_Core_App.endCall` очищает `state.lastCallTarget`, останавливает локальный поток (`HomeCall_Web_Media_Manager.stopLocalStream`) и вызывает `peer.end`.
2. Переход в `end` сохраняет строку `connectionMessage` (например, «Связь потеряна» или «Звонок завершён»), которую `HomeCall_Web_Ui_Screen_End` отображает в `#end-message`.
3. Кнопка «Вернуться в лобби» вызывает переданный `onReturn`, `HomeCall_Web_Core_App` обновляет контекст и снова показывает экран `lobby`, а `HomeCall_Web_Media_Manager` получает `media.prepare()` для быстрого восстановления потоков.
4. Если из-за потери соединения (soft/hard reconnect) возвращается сообщение об отсутствии сигнала, `HomeCall_Web_Ui_Toast` дополняет экран короткими статусами, а `HomeCall_Web_Core_App` уже заранее отправил сигнал `core:shutdown` через `HomeCall_Web_Shared_EventBus`.

## Особенности и уведомления

- `HomeCall_Web_Ui_Toast` остаётся активным: ошибки сигнализации, ручные действия в toolbar (`clear-cache`) и сообщения о повторных попытках восстановления отображаются там, пока пользователь читает итог.
- `HomeCall_Web_Core_App` оставляет документ в состоянии `state.currentState = 'end'`, хотя `signal` остаётся подключённым, чтобы ловить повторы; кнопка возвращает к `lobby` без очищения `storage`.
- `HomeCall_Web_Media_Manager` автоматически готовит локальные устройства сразу после закрытия экрана, чтобы они были готовы при следующем звонке.

## Связи

- `ctx/rules/web/ui/screens.md` — сценарий `call → end → lobby`.
- `ctx/rules/web/ui/screens/lobby.md` — экран, к которому ведёт кнопка «Вернуться в лобби».
