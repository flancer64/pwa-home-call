# Правила direct-interaction модулей

Path: `./ctx/docs/code/direct-interaction/module-rules.md`

Direct-interaction модули работают с `MediaStream`, WebRTC и сигналингом, поэтому они описывают только runtime-логику, не включая UI или архитектурные инварианты.

- `HomeCall_Web_Media_Manager$` запрашивает доступ к `navigator.mediaDevices`, при отсутствии API возвращает читаемый warning и не блокирует приложение. Потоки хранятся в памяти, а методы `setLocalStream`, `prepare`, `getLocalStream` обновляют `Peer`.
- `HomeCall_Web_Rtc_Peer$` инициализирует `RTCPeerConnection` через `env.RTCPeerConnection`, добавляет обработчики `track`, `icecandidate`, `connectionstatechange`, логирует изменения с префиксом `[Peer]` и предоставляет методы подписки на `remoteStream`.
- Local/remote stream обновляется только через `setLocalStream`/`remoteStreamListeners`, где `Peer` дозаписывает треки, но не хранит информацию о пользователях.
- В случае ошибки media/rtc логируется описание (`error.name`, `error.message`) на английском и выдаётся понятный toast через `HomeCall_Web_Ui_Toast$`.
- Модули не обращаются к `window` напрямую: используют `HomeCall_Web_Env_Provider$`, который возвращает устойчивые ссылки на `window`, `navigator`, `globalThis`.
- Candidate-обмен передаётся через `Signal_Client`/`Signal_Orchestrator`, в модулях direct-interaction нет собственного WebSocket-кода.

Эти правила действуют независимо от конкретного состояния UI: direct-interaction отвечает только за media/peer и сообщает о событиях другим контурам через DI и signal-слой.
