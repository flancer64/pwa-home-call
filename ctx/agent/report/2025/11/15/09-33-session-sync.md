# session-sync

## Резюме изменений
- Переписал браузерный поток на одноразовые sessionId: новый `SessionManager`, минималистичные экраны `home → invite → call → end`, обновлённый сигналинг без имён и комнат, шаблоны и сервисы отражают `/?session`.
- Перевёл серверный сигналинг на `sessionId`, добавил `SessionManager` в backend, переписал `SignalServer`, тесты и документацию (`ctx/rules/arch/back.md`, `ctx/rules/arch/back/signal.md`, `ctx/rules/node/testing.md`).
- Обновил `web/version.json` → `20251115-093321` чтобы отметить новую сборку.

## Детали работ
- Заменил `RoomManager` на `SessionManager` во фронтенде и бэкенде, убрал хранение имени/комнаты, адаптировал `CallFlow`, `InviteService`, `SignalClient`, UI-шаблоны и типы.
- Удалил устаревшее хранилище и лобби, добавил тесты для нового `SessionManager` и обновил существующие тесты под новую модель.
- Прописал новую документацию сигналинга: описал сообщения `join(sessionId)`, `offer/answer/candidate(sessionId)` и роль `HomeCall_Back_Service_Signal_SessionManager`.

## Результаты
- `npm run test:unit` (fails: `test/unit/Back/Service/Signal/Server.test.mjs` выводит лишь `'test failed'` — подробности подавляет фреймворк, но ошибка воспроизводится сразу при запуске этой проверки).
