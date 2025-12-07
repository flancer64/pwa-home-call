# Отчёт по работе с подсистемой routing
Path: `./ctx/agent/report/2025/12/07/08-33-routing.md`

## Цель
Перенести детализированные сведения о конкретных маршрутах в конфигурацию и описать Router как DI-конфигурируемую механику, не содержащую экранов.

## Действия
- Переписал `ctx/composition/client/ui/routing/AGENTS.md`, добавив инварианты о том, что Router не хранит маршруты и конфигурация обновляется вне него.
- Обновил `overview.md`, объяснив, что Router получает `routeConfig`/`defaultParams` через DI, а конкретные маршруты описываются в `routes.md`.
- Перестроил `router.md`, детализировав механическую последовательность обработки hash, обязанности Router и интерфейс фабрики контроллеров.
- Переделал `routes.md` в руководство по описанию маршрутов, оставив конкретный набор экранов только в блоке-примере.

## Артефакты
- `ctx/composition/client/ui/routing/AGENTS.md`
- `ctx/composition/client/ui/routing/overview.md`
- `ctx/composition/client/ui/routing/router.md`
- `ctx/composition/client/ui/routing/routes.md`
