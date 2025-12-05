# Правила модулей клиентского слоя

Path: `./ctx/code/client/module-rules.md`

Клиентские модули организованы вокруг нескольких границ: UI (Flow, Controller, Toast), media/RTC, signal/WebSocket, PWA и helpers. Правила гарантируют, что единый root-элемент управляется декларативно, а DOM обновляется только через контроллер.

## Flow и UI

- `HomeCall_Web_Ui_Flow$` получает `stateMachine`, `uiController`, `inviteService`, `toast`, `media` и `signal`, но все рендеры проходят через `HomeCall_Web_Ui_Controller$`. Flow никогда не лезет в DOM напрямую — он вызывает `renderState`, `updateRemoteStream` и `showSettings`.
- UI-контроллеры кешируют требуют `initRoot` перед рендером, работают с шаблонами из `web/app/Ui/Template` и публикуют результаты на русском языке через `HomeCall_Web_Ui_Toast$`.
- `InviteService` и `SessionManager` генерируют share link в `web/app/Ui/InviteService.mjs`, уведомляют Flow и передают только `sessionId`/`inviteUrl` без персональных данных.
- Toast-объекты не содержат состояния; они отображают только текущую ошибку или информационное сообщение и сбрасываются после закрытия.

## Storage и PWA

- Доступ к браузерным хранилищам идёт через `HomeCall_Web_Infra_Storage$`. В `localStorage` хранятся только флаги и версии (`lastCheckedVersion`, `featureFlags`, `pendingVersionUpdate`, `preferredUiFlow`, `autoToastSuppression`, `remoteLogging`). Все остальные поля остаются в памяти.
- Очистка кеша выполняется через `HomeCall_Web_Pwa_Cache$` и `HomeCall_Web_Pwa_ServiceWorker$`. Эти модули вызываются из `CacheCleaner`/`VersionWatcher` и выполняют удаление Service Worker / Cache API, не принимая пользовательских данных.
- `web/service-worker.js` относится к частному runtime, его handlers импортируют только PWA-модули и логгируют на английском.

## Сигналинг, медиавзаимодействие и безопасность

- Клиентские события пересылаются через `HomeCall_Web_Net_Signal_Client$`, который кэширует требования (offer/answer/candidate/hangup/error) и отправляет их по WebSocket вместе с `sessionId`.
- При ошибках signal-клиент делает reconnect с постепенным `setTimeout` (от 1 до 5 секунд) и логирует попытки через `[Signal]`.
- `HomeCall_Web_Media_Manager$` запрашивает разрешения с помощью `navigator.mediaDevices.getUserMedia`, очищает `MediaStream` после завершения и уведомляет `HomeCall_Web_Rtc_Peer$` о состоянии треков.
- SDK не хранит персональные данные: `sessionId` не попадает в localStorage, `inviteUrl` отображается только в UI и не записывается в permanent storage, логирование содержит только технические параметры.

## Кодирование и DI

- Все модули получают зависимости через `@teqfw/di` и не создают глобальных singletons.
- Внутренние функции (например, `handleStartCall`, `renderReady`) оформлены как `const`, а `this` не используется вне конструктора.
- Любая дополнительная логика (обработка ошибок, share link, toast) оформляется как отдельный helper или сервис и регистрируется через DI; Flow остаётся thin.
