# Отчёт по итерации UI screens

## Резюме изменений
- Перестроил клиентский контур композиции: экранные документы теперь живут в `ctx/composition/client/ui/screens` и отражены в картах уровней.
- Обновил описания, ссылки и контекстные карты (`client/`, `client/ui/`, `client/ui/screens/`) так, чтобы `ui/` выглядела как визуальный слой, включающий экраны.
- Привёл ссылки на экранные документы в файлах `file-structure`, `ux/logging`, `signal/runtime` и `server/file-structure` к новому пути.

## Детали работ
- перенёс каталог `ctx/composition/client/screens/` внутрь `ctx/composition/client/ui/`, сохранив содержание экранов;
- дополнил `ctx/composition/client/ui/AGENTS.md` новой секцией про `screens/`, описал экранные файлы в `ctx/composition/client/ui/screens/AGENTS.md`, убрал упоминание старого уровня `screens/` из `ctx/composition/client/AGENTS.md`;
- поправил все ссылочные пути и карты уровня, чтобы они указывали на `ctx/composition/client/ui/screens/`, и убедился, что `ctx/composition/client/file-structure.md`, `ctx/composition/server/file-structure.md`, `ctx/composition/signal/runtime.md` и `ctx/composition/client/ux/logging.md` дублируют новую организацию.

## Результаты
- Документация и карты уровня согласованы с новой вложенностью экранов в `ui/`.
- В тех местах, где экранные документы упоминались в описаниях и связях, пути теперь ведут к `ui/screens`.
- Корректность карт уровня подтверждена: `client/` отображает `ui/` как визуальную подсистему, а `ui/` содержит дерево `screens/`.
