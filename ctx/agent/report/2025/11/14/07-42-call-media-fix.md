# Call media fix

## Резюме изменений
- Перенёс слушатель статуса медиа в `WeakMap`, чтобы `HomeCall_Web_Ui_Screen_Call` не мутировал замороженное состояние и сразу заново инициализировал DOM/индикаторы при каждом `show()` (см. `ctx/rules/web/ui/screens/call.md`).
- Скорректировал диалоги `Peer ↔ SignalClient`, чтобы `sendOffer/Answer/Candidate` передавали payload `{room, from, ...}` и инициатор/принимающий устанавливали `target` перед отправкой кандидатов согласно `ctx/rules/web/contours/rtc.md`.
- Подтянул `web/version.json` до `20251114-074225`, как требует `web/AGENTS.md`.

## Детали работ
1. `Call.mjs` теперь очищает предыдущую подписку через `mediaStatusUnsubscribeRefs`, перестраивает DOM-референсы и повторно вызывает `media.bindLocalElements()` без мутаций экземпляра, а статусное сообщение идёт через `statusRefs`.
2. `App` передаёт `from`/`room`/`candidate` в `SignalClient`, а `Peer` сохраняет идентификатор `from` из `answer`, чтобы обмен кандидатов `sendCandidate` не зависел от undefined-таргета (то же покрытие залегло в `MediaManager` `prepare()`/`bindLocalElements`).
3. В отчёт включена запись о версии `20251114-074225`, подтверждая выполнение требования `web/AGENTS.md`.

## Результаты
- Call-сцена больше не вызывает `Cannot assign to read only property` и соблюдает жизненный цикл UI-индикаторов.
- WebRTC-рукопожатие теперь отправляет корректные `offer/answer/candidate` через сигнал, а кандидаты инициатора появляются после получения `answer` (согласно контуре RTC).
- Версия PWA поднята до `20251114-074225`, записано в `web/version.json` и отчёте.
