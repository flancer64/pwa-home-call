# Signal online handshake

## Резюме изменений
- Подключил `online`-канал сигналинга к `HomeCall_Web_Core_App`, чтобы инициатор знал имя собеседника перед вызовом `peer.start` и не пытался отправлять SDP до того, как второе соединение войдёт в комнату (`ctx/rules/web/contours/net.md`).
- Обновил контракт с `SignalClient` — теперь он поддерживает `joinRoom/leaveRoom`, и `configurePeer` передаёт поле `to` для любой `offer/answer/candidate`, что соответствует ожиданиям `HomeCall_Back_Service_Signal_Server`.
- Актуализировал юнит-тест `test/web/app/Core/App.test.mjs`, чтобы он имитировал `online`-уведомление, проверял `joinRoom` и подтверждал, что SDP отправляется только после того, как известен удалённый пользователь.
- Обновил `web/version.json` до версии `20251114-080313` в соответствии с `web/AGENTS.md`.

## Детали работ
1. Добавил хранение `state.remoteUser`, флаг `pendingPeerStart`, функции `joinSignalRoom/leaveSignalRoom`, `resetRemoteTarget`, `handleOnline` и `startPeerWithTarget`, чтобы `beginCallSession` перезапускал подписки и ждал `online`-события до вызова `Peer.start()`.
2. Расширил `configurePeer` на передачу `to` и обеспечил, что `Peer.handleOffer` сохраняет `data.from`, чтобы все сигналы доставлялись нужному участнику, а `media`/`ui` группы перерисовываются в рамках нового жизненного цикла.
3. Обновил тестовую среду: `signalClient` теперь сохраняет обработчики, тест получает `online`-событие, `peer.start` принимает таргет и `sendOffer` отправляет `to`, а проверки подтверждают `joinRoom` и `to: 'Bob'`.
4. Зафиксировал версию PWA `20251114-080313`, чтобы правило `web/AGENTS.md` соблюдалось.

## Результаты
- Сигналинг больше не падает с `Join a room before sending signaling messages`, потому что инициатор ждёт появления второго участника и всегда указывает `to`.
- `node --test test/web/app/Core/App.test.mjs` проходит.
- `web/version.json` обновлён до `20251114-080313` и зафиксирован в этом отчёте.
