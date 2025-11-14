# Контур Net и сигналинг

Этот документ описывает контур **Net**, управляющий WebSocket-соединением сигналинга ДомоЗвон.

## Назначение

Net отвечает за надёжную передачу SDP и ICE между участниками. Он не использует события `net:*` на шине, а работает через методы `sendSignal(signal)` и коллбэки `onSignal(payload)`, которые передаются другим контурам через DI.

---

## Границы и интерфейсы

- **WebSocket-протокол**: одно устойчивое соединение `wss://<host>/signal` через `HomeCall_Web_Net_SignalClient$`; сообщения содержат типы: `join`, `leave`, `offer`, `answer`, `candidate`, `error`.
- **Входные события**: `Core` передаёт `room` и команды `sendOffer`/`sendAnswer`/`sendCandidate`; `Env` предоставляет URL `wss://`.
- **Выходные коллбэки**: `onSignal(signal)` передаётся `Rtc`, чтобы применить входящие `offer/answer/candidate`.
- **Переходы**: при отключении `Net` вызывает `onDisconnect()` у Core и запускает переподключение без промежуточных списков пользователей.

Нет `online`-событий или списков пользователей — `join`/`leave` служат только для регистрации и освобождения слотов, а весь обмен `offer/answer/candidate` остаётся строго 1:1 и логируется через `HomeCall_Web_Shared_Logger$`.

---

## Типичные DI-зависимости

- `HomeCall_Web_Net_SignalClient$`
- `HomeCall_Web_Net_EventTranslator$`
- `HomeCall_Web_Shared_Logger$`
- `HomeCall_Web_Env_Provider$`
- `HomeCall_Web_Shared_Util$`

---

## Контейнер и взаимодействия

Net разворачивается через `@teqfw/di`. Он получает callback `onSignal` при регистрации и вызывает его при поступлении данных через WebSocket. Публикаций в `Shared.EventBus` нет — `Core` и `Rtc` обмениваются информацией напрямую через переданные методы.

---

## Связи

- `ctx/rules/web/app.md` — `call`-состояние инициирует подключение и отключение.
- `ctx/rules/web/contours/core.md` — `Net` вызывает `Core.onDisconnect()` и принимает `room` для `sendSignal`.
- `ctx/rules/web/contours/rtc.md` — передаёт входящие `offer/answer/candidate`.
- `ctx/rules/web/infra/ws.md` — описание JSON-сообщений.
- `ctx/rules/web/contours/shared.md` — логгер и утилиты для обработки сообщений.

---

## Итог

Контур Net обеспечивает прямой обмен сигналами без списков пользователей и без EventBus — всё строится на DI и обратных вызовах, что делает архитектуру Tequila Framework последовательной и предсказуемой.
