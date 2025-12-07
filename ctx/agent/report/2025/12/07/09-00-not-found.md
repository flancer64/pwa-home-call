# Отчёт по поведению fallback-экрана
Path: `./ctx/agent/report/2025/12/07/09-00-not-found.md`

## Цель
Обеспечить фиксированное поведение `not-found`: кнопка всегда возвращает на `home`, не полагаясь на внешние параметры.

## Действия
- Добавил `ensureFallbackReturn` в `HomeCall_Web_Ui_Router`, чтобы параметры `fallback`-маршрута содержали `onReturn`, вызывающий `navigate('home')`, даже если конфигурация не передаёт его явно.
- Документально зафиксировал контракт `not-found` с `onReturn`, возвращающим `home`, в `routes.md`, `overview.md` и `router.md`.
- Перезапустил unit-тест `test/web/app/Ui/Router.test.mjs`, чтобы удостовериться, что новые параметры не ломают механизмы навигации.

## Артефакты
- `web/app/Ui/Router.mjs`
- `ctx/composition/client/ui/routing/routes.md`
- `ctx/composition/client/ui/routing/overview.md`
- `ctx/composition/client/ui/routing/router.md`
