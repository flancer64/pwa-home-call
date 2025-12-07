# Отчёт по конфигурации маршрутов
Path: `./ctx/agent/report/2025/12/07/10-55-router-config.md`

## Цель
Сделать так, чтобы Router конфигурировался через DI-модуль, который может инкрементно регистрировать маршруты и подставлять реальные обработчики из Flow.

## Действия
- Обновил `ctx/composition/client/ui/routing/*` документацию, добавив описание API конфигурации (`registerRoute`, `setDefaultParams`) и усилив правила, чтобы Flow/приложение могли вписывать кастомные обработчики прямо в конфиг.
- Переписал `web/app/Ui/Router.mjs`, чтобы он подписывался на snapshot из `Router_Config`, пересобирал таблицы маршрутов при изменении и больше не инициализировал конфигурацию единовременно.
- Реализовал новый `HomeCall_Web_Ui_Router_Config$`, хранящий Map-ы маршрутов и параметров, показывающий API регистрации, инициализирующий базовые `home/call/...` маршруты и уведомляющий Router о изменениях.
- Изменил `HomeCall_Web_Ui_Flow`, чтобы он получил конфиг и вызывал `setDefaultParams` каждый раз перед `router.navigate`, так real-коллбэки попадали в конфигурацию, включая параметры при прямом hash-переходе.

## Артефакты
- `ctx/composition/client/ui/routing/AGENTS.md`
- `ctx/composition/client/ui/routing/overview.md`
- `ctx/composition/client/ui/routing/router.md`
- `ctx/composition/client/ui/routing/routes.md`
- `web/app/Ui/Router.mjs`
- `web/app/Ui/Router/Config.mjs`
- `web/app/Ui/Flow.mjs`
