# Отчёт по прямому переходу not-found
Path: `./ctx/agent/report/2025/12/07/10-13-not-found-root.md`

## Цель
Обеспечить, чтобы fallback `not-found` всегда переводил пользователя на корень `/`, не полагаясь на Router для навигации между экранами.

## Действия
- Обновил `HomeCall_Web_Ui_Router` так, чтобы он добавлял `onReturn` в параметры fallback-маршрута, если он отсутствует, и эта callback сразу присваивает `window.location` корню `/`.
- Переписал документацию routing-level так, чтобы она отражала новое поведение `not-found` и подчёркивала, что fallback сам манипулирует `window.location`, несмотря на конфигурацию маршрутов.

## Артефакты
- `web/app/Ui/Router.mjs`
- `ctx/composition/client/ui/routing/overview.md`
- `ctx/composition/client/ui/routing/router.md`
- `ctx/composition/client/ui/routing/routes.md`
