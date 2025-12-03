# Нормализация уровня `ctx/architecture`

## Резюме изменений

- Перенёс документацию, не относящуюся к архитектурной форме, в соответствующие уровни: PWA/окружение (`ctx/environment/pwa.md`, `ctx/environment/overview.md`, `ctx/environment/ws-runtime.md`), UI/дизайн (`ctx/design/screens/ui.md`) и код (`ctx/code/di-contracts.md`).
- Сохранил за `ctx/architecture` только контуры, состояние и сигналинг: обновил `overview.md`, `server.md`, `client.md`, `messaging.md` и `web/infra/ws.md`, ссылаясь на новые документы и удалив детали `.env`, TLS, DI-контракты, DOM/UX-фрагменты и очереди.
- Проинтегрировал перемещённые требования в `ctx/environment` (описание Apache, TLS, `.env`, WebSocket runtime), расширил `ctx/constraints/node.md` новыми ограничениями очередей и повторных подключений и убедился, что такие модели перечислены в новых ссылках.

## Детали работ

- `ctx/environment/pwa.md` теперь хранит весь материал про service worker, verison.json и HomeCall-агенты; `ctx/environment/overview.md` собирает Apache, `.env` и связи с TLS/logrotate/systemd; `ctx/environment/ws-runtime.md` описывает клиентское поведение, очистку очередей и ошибки WebSocket.
- `ctx/design/screens/ui.md` стал местом для state machine, overlay и DevRouter; архитектурный каталог больше не упоминает DOM/overlay-фрагменты, а `ctx/design/screens/AGENTS.md` и `ctx/architecture/web/contours/AGENTS.md` обновлены соответственно.
- `ctx/code/di-contracts.md` аккумулирует перечень `HomeCall_Web_*` контрактов и `Flow/Machine` как кодовые артефакты; `ctx/architecture/client.md` теперь ссылается на этот файл и не содержит конкретных контрактов или файлов.
- `ctx/constraints/node.md` включает новую секцию про FIFO-очереди, лимит в два сокета, повторные подключения и понятные ошибки; архитектурный `messaging.md` и `web/infra/ws.md` ссылаются на constraints/ environment, а не на детали поведения.

## Проверка и ADSM

- Все затронутые документы проверены на соответствие 8 критериям: декларативность, полнота, непротиворечивость, связность, плотность, компактность, неизбыточность и отсутствие описаний поведения по умолчанию. Нарушений не обнаружено, так как операционные детали теперь вынесены в уровень `environment` и `constraints`, а архитектурные файлы описывают только форму.

## Следующие шаги

1. Человеку: подтвердить, что новая карта `ctx/environment/overview.md` и DI-спецификация `ctx/code/di-contracts.md` отражают все эксплуатационные договорённости, прежде чем использовать их как опору для остальных уровней.
