# Структура direct-interaction

Path: `./ctx/docs/code/direct-interaction/structure.md`

Direct-interaction охватывает всё, что связано с медиапотоками, RTCPeerConnection и обработкой сессий. Код располагается внутри клиентского контурного каталога, но в отдельной зоне, поскольку он работает непосредственно с браузерными API.

- `web/app/Media/Manager.mjs` и `Media/Monitor.mjs` управляют потоками `MediaStream`, отслеживают статус микрофона/камеры и публикуют события через DI.
- `web/app/Rtc/Peer.mjs` обёртывает `RTCPeerConnection`, подписывается на `track`, `icecandidate` и предоставляет методы `sendOffer`, `sendAnswer`, `sendCandidate`, `subscribeRemoteStream`.
- `web/app/Net/Session/Manager.mjs` управляет `sessionId`, генерирует invite URL и очищает параметры из истории браузера.
- `web/app/State` содержит модули, отслеживающие статус media/peer, но не сохраняет данные в постоянное хранилище.
- `test/web/app/Media`, `test/web/app/Rtc` и соответствующие helper-ы обеспечивают зеркальное покрытие.
