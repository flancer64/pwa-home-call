# Отчёт по доработке Router
Path: `./ctx/agent/report/2025/12/07/08-43-router-code.md`

## Цель
Привести реализацию `HomeCall_Web_Ui_Router` в соответствие с DI-конфигурируемой документацией: Router должен оперировать внешней конфигурацией маршрутов, не хранить экранную карту и обрабатывать динамические сегменты через описания.

## Действия
- Переписал `web/app/Ui/Router.mjs`, убрав жёсткие маршруты и параметры, добавив поддержку `routeConfig`/`defaultParams`, `segmentParams`, флагов `initial`/`fallback` и генерацию hash на основе конфигурации.
- Добавил `web/app/Ui/Router/Config.mjs`, который экспортирует описания маршрутов, фабрики контроллеров и значения параметров по умолчанию, включая начальный и fallback-маршруты.
- Обновил `test/web/app/Ui/Router.test.mjs`, адаптировав зависимости к новому API, и подтвердил поведение тестом `node --test test/web/app/Ui/Router.test.mjs`.
- Поддержал документацию `routes.md`/`router.md`, описав новые поля конфигурации (`segmentParams`, `initial`) и примеры.

## Артефакты
- `web/app/Ui/Router.mjs`
- `web/app/Ui/Router/Config.mjs`
- `test/web/app/Ui/Router.test.mjs`
- `ctx/composition/client/ui/routing/router.md`
- `ctx/composition/client/ui/routing/routes.md`
