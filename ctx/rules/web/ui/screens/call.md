# Call Screen

**Путь**: ./rules/web/ui/screens/call.md

## Назначение

Экран `call` отображает активную видеосессию: чужой поток занимает фон, локальная миниатюра держится поверх него, а управление собой и подключением остаётся доступным.

## Основные этапы взаимодействия

1. `HomeCall_Web_Core_App` переводит состояние в `call`, показывает шаблон `call`, передаёт в `ui.showCall` актуальный `remoteStream` и протолкнутые коллбэки `onEnd` и `onRetry`.
2. `HomeCall_Web_Media_Manager` привязывает `#local-video`, `#no-media`, `#retry-media` к текущему локальному потоку и следит за состояниями камер/микрофонов: без устройства скрывает видео и показывает сообщение «Видео недоступно, но разговор возможен», при появлении устройств скрывает предупреждение и снова показывает миниатюру.
3. `HomeCall_Web_Rtc_Peer` обновляет `state.remoteStream`, и `ui.updateRemoteStream` заменяет медиаэлемент; `ui.updateCallConnectionStatus` используется для выводов сообщения о повторных попытках (`HomeCall_Web_Core_App` контролирует soft/hard reconnect и показывает индикатор при потере связи).
4. Кнопка «Завершить звонок» вызывает `HomeCall_Web_Core_App.endCall`, который очищает локальный поток (`media.stopLocalStream`), завершает Peer и переходит в `end`. Кнопка «Повторить попытку» триггерит `media.prepare()` и доверяет менеджеру повторно запросить разрешения.

## Особенности и уведомления

- `HomeCall_Web_Media_Manager` не только связывает DOM-элементы, но и эмитирует `media:status` / `media:ready`, сообщает `HomeCall_Web_Core_App` о восстановлении устройств (`devicechange`) и помогает отображать лаконичные статусы в `no-media`. Повторный вызов `media.prepare()` дублирует ту же очередь `HomeCall_Web_Ui_Toast`, что и кнопка на экране `enter`.
- `HomeCall_Web_Ui_Toast` служит каналом для информационных сообщений от toolbar'а (`info`, `settings`) и для `HomeCall_Web_Core_App`, когда он сообщает об изменении медиа-контекста или ручной очистке кэша.
- `HomeCall_Web_Rtc_Peer` и `HomeCall_Web_Net_SignalClient` совместно обслуживают сигналы `offer/answer/candidate`, а `HomeCall_Web_Core_App` перехватывает ошибки, переводя пользователя в `end` с объяснением причины через `connectionMessage`.

## Связи

- `ctx/rules/web/ui/screens.md` — последовательность экранов и переходов.
- `ctx/rules/web/ui/screens/end.md` — следующий экран, когда вызов завершён.
