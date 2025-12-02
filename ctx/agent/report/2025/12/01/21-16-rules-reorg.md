# Документальное перераспределение `ctx/rules`

## Резюме изменений

- Распределил существующие файлы из `ctx/rules/` по уровням ADSM: product, design, architecture и code, сохранив все тексты и добавив архивную ссылку на старую карту.
- Обновил `AGENTS.md` на уровнях «product», «design» и «architecture», чтобы карты соответствовали новым каталогам, и переадресовал сервисные страницы, PWA-инфраструктуру и окружение.
- Физически удалил `ctx/rules/` (остался только архивный файл в `ctx/architecture/legacy-rules.md`), создав новые каталоги `ctx/product/split-plan.md`, `ctx/design/service-pages/…`, `ctx/architecture/web/…`, `ctx/architecture/env/…` и `ctx/code/{testing,node,arch}`.

## Детали работ

### Реестр переместившихся документов

| Уровень | Исходный путь | Новый путь |
| --- | --- | --- |
| product | `ctx/rules/split-plan.md` | `ctx/product/split-plan.md` |
| design | `ctx/rules/web/logging.md` | `ctx/design/logging.md` |
| design | `ctx/rules/web/ui/AGENTS.md` | `ctx/design/service-pages/AGENTS.md` |
| design | `ctx/rules/web/ui/page/AGENTS.md` | `ctx/design/service-pages/page/AGENTS.md` |
| design | `ctx/rules/web/ui/page/index.md` | `ctx/design/service-pages/page/index.md` |
| design | `ctx/rules/web/ui/page/reinstall.md` | `ctx/design/service-pages/page/reinstall.md` |
| architecture | `ctx/rules/web/AGENTS.md` | `ctx/architecture/web/AGENTS.md` |
| architecture | `ctx/rules/web/app.md` | `ctx/architecture/web/app.md` |
| architecture | `ctx/rules/web/contours/AGENTS.md` | `ctx/architecture/web/contours/AGENTS.md` |
| architecture | `ctx/rules/web/contours/core.md` | `ctx/architecture/web/contours/core.md` |
| architecture | `ctx/rules/web/contours/env.md` | `ctx/architecture/web/contours/env.md` |
| architecture | `ctx/rules/web/contours/media.md` | `ctx/architecture/web/contours/media.md` |
| architecture | `ctx/rules/web/contours/net.md` | `ctx/architecture/web/contours/net.md` |
| architecture | `ctx/rules/web/contours/rtc.md` | `ctx/architecture/web/contours/rtc.md` |
| architecture | `ctx/rules/web/contours/shared.md` | `ctx/architecture/web/contours/shared.md` |
| architecture | `ctx/rules/web/contours/ui.md` | `ctx/architecture/web/contours/ui.md` |
| architecture | `ctx/rules/web/infra/AGENTS.md` | `ctx/architecture/web/infra/AGENTS.md` |
| architecture | `ctx/rules/web/infra/pwa.md` | `ctx/architecture/web/infra/pwa.md` |
| architecture | `ctx/rules/web/infra/storage.md` | `ctx/architecture/web/infra/storage.md` |
| architecture | `ctx/rules/web/infra/ws.md` | `ctx/architecture/web/infra/ws.md` |
| architecture | `ctx/rules/arch/env/apache.md` | `ctx/architecture/env/apache.md` |
| architecture | `ctx/rules/arch/env/config.md` | `ctx/architecture/env/config.md` |
| architecture | `ctx/rules/arch/env/logrotate.md` | `ctx/architecture/env/logrotate.md` |
| architecture | `ctx/rules/arch/env/node.md` | `ctx/architecture/env/node.md` |
| architecture | `ctx/rules/arch/env/systemd.md` | `ctx/architecture/env/systemd.md` |
| architecture | `ctx/rules/arch/structure.md` | `ctx/architecture/structure.md` |
| architecture | `ctx/rules/deploy.md` | `ctx/architecture/deploy.md` |
| code | `ctx/rules/codex.md` | `ctx/code/codex.md` |
| code | `ctx/rules/language.md` | `ctx/code/language.md` |
| code | `ctx/rules/privacy.md` | `ctx/code/privacy.md` |
| code | `ctx/rules/arch/teqfw.md` | `ctx/code/arch/teqfw-overview.md` |
| code | `ctx/rules/arch/teqfw/di.md` | `ctx/code/arch/teqfw/di.md` |
| code | `ctx/rules/arch/teqfw/module-template.md` | `ctx/code/arch/teqfw/module-template.md` |
| code | `ctx/rules/arch/testing.md` | `ctx/code/testing/arch.md` |
| code | `ctx/rules/node/bin/server.md` | `ctx/code/node/bin/server.md` |
| code | `ctx/rules/node/testing.md` | `ctx/code/testing/node.md` |
| code | `ctx/rules/web/testing.md` | `ctx/code/testing/web.md` |
| архив | `ctx/rules/AGENTS.md` | `ctx/architecture/legacy-rules.md` |

### Дубли

- [Разбивочный план](ctx/product/split-plan.md) полностью повторяет план `ctx/agent/plan/2025/11/20251129-rules-split-plan.md`. Оба описывают одинаковую семантическую разбивку корпуса, но новый файл остался в product-пространстве как навигационная опора. Нужно решить, какой из них делать первичным (предположительно `ctx/product/split-plan.md`) и обновить ссылки.

### Невозможно классифицировать

- `ctx/architecture/legacy-rules.md` — архивная карта `ctx/rules/`, она не описывает продукт/constraints/architecture/design/code напрямую, а служит справкой для перехода. Пока оставил её в `ctx/architecture` как «таргет» чистки, но стоит явно пометить как legacy, чтобы она не мешала новым уровням.

### Требуют уточнения

- `ctx/architecture/web/app.md` пересекает архитектурные контуры и UI-состояния (`ready`, `waiting`, `active`, `ended`). Нужно решить, разрезается ли на две части (чисто архитектура + ссылка на дизайн) или оставляется целиком на архитектуре.
- `ctx/design/logging.md` содержит описание поведения интерфейса, но оно тесно завязано на требования из `ctx/constraints/conventions.md`. Следует уточнить, где должны жить политики логирования (constraints) и где — их представление в UI (design).
- `ctx/architecture/web/contours/ui.md` описывает state machine и hash-роутинг, но также ссылается на `ctx/design/state`. Хорошо бы согласовать, где логика управления состоянием лежит: в архитектуре или в design/state.

## Результаты

- `ctx/rules` стал пустым: все толковые документы перемещены, а старая карта осталась в виде `ctx/architecture/legacy-rules.md`.
- `ctx/product` теперь хранит `split-plan.md` и обновлённую карту уровня.
- `ctx/design` содержит логирование и сервисные страницы в `service-pages/`, как этого требует ADSM.
- `ctx/architecture` группирует `env/` и `web/` (со всеми контурами и infra), а `ctx/code` агрегирует `codex`, `language`, `privacy`, DI/teqfw и тестовые политики (`testing/` + `node/bin`).
- Явные «дубли» и неоднозначности зафиксированы для дальнейшего уточнения человеком.
