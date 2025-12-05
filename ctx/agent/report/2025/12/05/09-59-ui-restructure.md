# Резюме изменений

- Перенёс клиентскую документацию UI в новую семантику: `ui/layout`, `ui/components`, `ui/patterns`, `states` и связанные AGENTS.
- Описал overview, call-макет, FAB-панель, toasts и share-link наложение в новых файлах и обновил экранные/состояния документы, чтобы они ссылались на новую структуру.
- Обновил карту уровня `ctx/composition/client/AGENTS.md` и создал AGENTS в новых каталогах, сохранив декларативность документации.

# Детали работ

1. Разбил старый `ui-elements/layout.md` на `skeleton`, `call`, `share-link` overlay и overview, собрав FAB и toasts в `patterns` и компонентах.
2. Переименовал `ui-states` в `states`, переписал `states.md` и `share-link.md`, чтобы они ссылались на layout-файлы, и обновил экраны `home`, `invite`, `settings`, `end` для новых путей.
3. Обновил все карты `AGENTS.md` на уровнях `client`, `ui/`, `states/`, `ui/components/`, `ui/layout/`, `ui/layout/overlays/`, `ui/patterns/` и проверил отсутствие ссылок на `ui-elements/`, `ui-states/` и `direct-interaction/media-views.md` внутри `ctx/composition/client`.

# Результаты

- Структура `ctx/composition/client/` теперь соответствует требуемой модели: новые layout-компоненты, паттерны, состояния и AGENT-карты задокументированы.
- Проведена проверка: `rg` по `ctx/composition/client/` не находит устаревших путей, а `Path:`-строки и ссылки обновлены.
- Кодовая часть (`web/`, `src/`, `test/` и др.) оставлена без изменений, как требовалось.
