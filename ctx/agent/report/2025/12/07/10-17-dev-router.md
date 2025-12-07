# Отчёт по удалению DevRouter
Path: `./ctx/agent/report/2025/12/07/10-17-dev-router.md`

## Цель
Убрать DevRouter из запуска PWA и привести типы/тесты в соответствие с новым набором модулей.

## Действия
- Удалил `HomeCall_Web_Ui_Router_Dev$` из интерфейса `HomeCall_Web_App` и убрал инициализацию `startDevRouter`, оставив только запуск основного Router.
- Обновил `web/app/types.d.js`, чтобы больше не объявлять тип `HomeCall_Web_Ui_Router_Dev`.
- Удалил `web/app/Ui/Router/Dev.mjs` и связанный unit-тест; теперь DevRouter больше не присутствует в дереве зависимостей.

## Артефакты
- `web/app/App.mjs`
- `web/app/types.d.js`
- `web/app/Ui/Router/Dev.mjs` (удалён)
- `test/web/app/Ui/Router/Dev.test.mjs` (удалён)
