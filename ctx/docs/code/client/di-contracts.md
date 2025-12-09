# DI-контракты клиентского контура

Path: `./ctx/docs/code/client/di-contracts.md`

Клиентская реализация опирается на фрагментированную модель модулей, зарегистрированных в `@teqfw/di`. Ниже описаны ключевые контрактные точки, которые используются агентом Codex и тестами при генерации UI и PWA-логики.

- `HomeCall_Web_Core_App$` — точка сборки client-контекста: создаёт UI/Net/Media модули, передаёт `HomeCall_Web_Env_Provider$` и запускает `Flow` через `start()`/`stop()`; не содержит бизнес-логики, только композицию.
- `HomeCall_Web_Ui_Flow$` — оркестратор клиентских хэндлеров. Получает контроллер, toast, invite-service, медиа и сетевой слой, подписывает обработчики и сообщает UI, когда нужно обновить DOM. Flow делегирует рендер `HomeCall_Web_Ui_Controller$`, а не управляет DOM напрямую.
- `HomeCall_Web_Ui_Controller$` — рендерит состояния в единственном root-элементе, кэширует DOM-узлы и публикует методы `renderState`, `updateRemoteStream`, `showSettings`.
- `HomeCall_Web_Net_Session_Manager$` — создаёт UUID сессии, храниит invite URL и очищает параметры из `window.history`; используется в UI при генерации ссылок и передаёт `sessionId` в `Signal_Client`.
- `HomeCall_Web_Net_Signal_Client$` — WebSocket-клиент: устанавливает соединение по `wss://<host>/signal`, ведёт очередь сообщений, перезапускается через `generateReconnectDelay`, и пересылает payload с `sessionId`, `offer/answer/candidate/hangup/error` в `Signal_Orchestrator`.
- `HomeCall_Web_Media_Manager$` — инициализирует `navigator.mediaDevices`, следит за локальным `MediaStream` и обновляет `Peer` через `peer.setLocalStream`; публикует статусы `blocked`, `denied`, `not-found` в `stateTrackers`. Передача локального потока в `main-video` и overlay происходит с `muted`, автоплей звука запрещён, а переключение на remote stream и включение аудио происходит только после `peer.subscribeRemoteStream`.
- `HomeCall_Web_Rtc_Peer$` (перечислено здесь из direct-interaction, но участвует в клиентском контуре) — инкапсулирует `RTCPeerConnection`, подписывает `track` и `icecandidate`, предоставляет методы `sendOffer`, `sendAnswer`, `sendCandidate`, `subscribeRemoteStream`; `subscribeRemoteStream` ставит remote stream в `main-video` с включённым звуком и не смешивает локальные треки в output.
- `HomeCall_Web_Ui_Toast$` — централизованная точка оповещений: принимает `info`, `error`, `warn` и показывает сообщения на русском через шаблон `web/app/Ui/Toast.mjs`.
- `HomeCall_Web_Pwa_ServiceWorker$`/`HomeCall_Web_Pwa_Cache$` — управляют регистрацией Service Worker и очисткой кешей при обновлении, используются в `CacheCleaner` и `VersionWatcher`.
- `HomeCall_Web_Env_Provider$` — фасад для `window`, `document`, `navigator`, `RTCPeerConnection`, `WebSocket`, `localStorage`; все клиентские модули зависят от него для безопасного доступа к runtime-API.
- `HomeCall_Web_Logger$` — логгер с методами `info`, `warn`, `error`, `debug`; используется всеми UI и сетевыми модулями и логирует только английские сообщения.

Тесты и Codex-генерация создают каждый токен через контейнер и не подменяют зависимости вручную. Если в контракт добавляется новый метод или зависимость, обновите описание и зарегистрируйте его в тестах через DI.
