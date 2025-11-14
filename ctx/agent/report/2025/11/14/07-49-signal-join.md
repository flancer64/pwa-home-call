# Signal join fix

## Резюме изменений
- Добавил `joinRoom`/`leaveRoom` в `SignalClient` и заставил UI-контроллер отправлять `join` перед началом звонка, а `leave` — при завершении, чтобы соответствовать контракту WebSocket-сервера и избежать ошибки «Join a room before sending signaling messages». Критичные места описаны в `ctx/rules/web/contours/rtc.md` и `ctx/rules/web/contours/net.md`.
- Улучшил `HomeCall_Web_Core_App` для вызова этих сообщений при `beginCallSession`, в `endCall` и при возврате на главный экран, сохраняя внутренний флаг `signalRoomJoined`.
- Актуализировал тест `test/web/app/Core/App.test.mjs`, чтобы имитировать `joinRoom` и проверять поступление вызова перед отправкой offer/answer, и запустил его (`node --test test/web/app/Core/App.test.mjs`).
- Поднял `web/version.json` до `20251114-074915` согласно правилам `web/AGENTS.md`.

## Детали работ
1. `SignalClient` теперь экспортирует `joinRoom`/`leaveRoom`, использующие тот же `envelope`-механизм, что и сигнальные сообщения, чтобы `from`/`room`/`user` приходили стабильно.
2. `Core/App` хранит флаг `signalRoomJoined`, посылает `joinRoom` как только известны `room` и `name`, сбрасывает флаг через `leaveRoom`, а также вызывает `leaveSignalRoom()` перед возвратом на домашний экран или при `endCall`, чтобы сервер удалял сессию.
3. Тестовый стенд дополнил `signalClient` методом `joinRoom`, проверил, что `join` происходит до отправки offer и что `join.payload.room` совпадает с пригласительной комнатой; для надежности запуск `node --test test/web/app/Core/App.test.mjs` проходит без ошибок.
4. Отдельно зафиксирован выпуск новой версии `20251114-074915`, чтобы изменение веб-слоя отразилось в PWA-манифесте.

## Результаты
- Клиент больше не получает ошибку `Join a room before sending signaling messages.` при начале звонка, так как сервер видит `join` до offer/answer/кандидата.
- Симуляция юзер-флоу (`prep → join → start offer`) укладывается в тесты, их прогон прошёл успешно.
- `web/version.json` поднят до `20251114-074915`, версия упомянута в отчёте и готова к выпуску.
