# Design Transfer Report

Path: `ctx/agent/report/2025/12/01/20-38-design-transfer.md`

## Резюме изменений
- Выделен новый уровень `ctx/design/` с обзором, картами и декларациями для макетов, экрана, компонентов и состояний.
- Перенесены материалы из `ctx/rules/web/` (layout, style, screens, share-link, notifications, component и screen) в `ctx/design/` и приведены к декларативной форме.
- Очистили `ctx/rules/web/` от дизайн-описаний, обновили `AGENTS.md` и ссылки (`ctx/rules/web/app.md`, `ctx/rules/web/contours/ui.md`) на новые пути.

## Детали работ
- Созданы `ctx/design/` + подкаталоги `screens/`, `layouts/`, `modules/`, `state/`, добавлены `AGENTS` для каждого уровня и новый `overview.md`.
- Написаны точные описания каждого экрана, компонента, layout-а и overlay-а share-link, которые теперь живут в новом пространстве и используют только декларативные описания зон, слотов и визуальных контрактов.
- Удалены устаревшие файлы из `ctx/rules/web/ui/` и скорректированы инструкции/карты на реализованный дизайн, чтобы уровень `rules` сосредоточился на инфраструктуре и состояниях.

## Результаты
- Дизайн теперь имеет собственную кодовую ветку: `ctx/design/layouts/`, `ctx/design/modules/`, `ctx/design/screens/`, `ctx/design/state/`, каждая с AGENTS и чёткой картой.
- Остатки `ctx/rules/web/` теперь описывают только инфраструктуру (contours, infra, pages), а `ctx/rules/web/app.md` и `ctx/rules/web/contours/ui.md` ссылаются на новые `ctx/design/state/*` документы.
- Отчётность соблюдена: архитектура, продукт и constraints остаются нетронутыми, а design-уровень даёт однозначный набор «что существует» в интерфейсе.
