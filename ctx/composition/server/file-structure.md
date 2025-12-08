# Файлoвая карта серверных точек

Путь: `ctx/composition/server/file-structure.md`

## Назначение

Фиксирует, какие статические страницы обслуживает проект и как они соотносятся с UI-сессией.

## Структура

- `/index.html` — базовый контейнер вместе с `app.js`, `manifest.json`, `service-worker.js` и `version.json` (см. `ctx/composition/server/service-pages/index.md`).
- `/reinstall.html` — страница ручного восстановления (см. `ctx/composition/server/service-pages/reinstall.md`).
- Обе страницы размещаются в корне и разделяют общую типографику и палитру, чтобы выглядеть как часть одного приложения.

## Связи

- Эти страницы служат фоном для `ctx/composition/client/ui/screens/` и `ctx/composition/direct-interaction/` — они не переключают экран, а позволяют запустить или восстановить UI-контейнер.
