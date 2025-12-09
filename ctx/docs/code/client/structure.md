# Структура клиентского контура

Path: `./ctx/docs/code/client/structure.md`

Клиентская часть живёт в `web/app/` и содержит модули PWA, UI, сессий, медиаменеджеров и сетевого слоя. Тесты отражают ту же структуру в `test/web/`.

- `web/app/Core.mjs` и `web/app/App.mjs` собирают окружение, регистрируют DI и связывают Flow, Net и Media. Они не содержат бизнес-логики, только инициализацию компонентов и подписки.
- `web/app/Ui/` — контроллеры, шаблоны, `Flow`, `Toast` и `ShareLinkService`. Этот каталог обслуживает один DOM-root и предоставляет hooks (`renderState`, `bindHandlers`, `shareSessionLink`).
- `web/app/Net/` содержит `Session/Manager` (генерация `sessionId`, invite URL), `Signal/*` (WebSocket-клиент, orchestrator), а также модули, которые прокидывают события в Flow.
- `web/app/Media/` управляет доступом к камере и микрофону, экспонирует `Media_Manager` и `Monitor`, публикует статус, не хранит данные о пользователях и гарантирует, что локальный поток в DOM остаётся muted до появления remote stream (а overlay-элемент всегда без звука).
- `web/app/Pwa/` и `web/service-worker.js` регулируют кеш, Service Worker и обновления (`HomeCall_Web_Pwa_Cache$, HomeCall_Web_Pwa_ServiceWorker$`).
- `web/app/Env/` инкапсулирует доступ к `window`, `navigator`, `WebSocket`, `RTCPeerConnection`, `localStorage` и используется во всех компонентах, чтобы выстраивать безопасные guard-ы.
- `web/app/State/` содержит состояние UI/Media, но никакие документированные статусы не сохраняются в `localStorage`.

Хранение данных ограничивается метаданными (`lastCheckedVersion`, `featureFlags`, `pendingVersionUpdate`, `preferredUiFlow`, `autoToastSuppression`). sessionId и share-link существуют только в оперативной памяти или передаются через URL; постоянные хранилища очищаются `HomeCall_Web_Pwa_Cache$`/`ServiceWorker`, а подробности зафиксированы в `ctx/docs/constraints/storage.md`.
