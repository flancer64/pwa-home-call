## Резюме изменений
- Перенёс реализационные инварианты к новым документам уровня `ctx/constraints` (сеанс, ссылка, узел, хранение, общие ограничения) и обновил карту уровня `ctx/constraints/AGENTS.md`.
- Перенаправил ключевые rule-документы (`ctx/rules/architecture.md`, `ctx/rules/privacy.md`, `ctx/rules/arch/back.md`, `ctx/rules/arch/env/*.md`, `ctx/rules/web/infra/storage.md`) на новые ресурсы, чтобы сам контекст правил не дублировал инварианты.

## Детали работ
- `ctx/constraints/session.md`, `ctx/constraints/link.md`, `ctx/constraints/node.md`, `ctx/constraints/storage.md`, `ctx/constraints/conventions.md` — собрал декларации invariant по сеансу, ссылке, серверу, хранению данных и общим инженерным ограничениям.
- `ctx/constraints/AGENTS.md` — добавил карту уровня, отражающую структуру новых файлов.
- `ctx/rules/architecture.md`, `ctx/rules/privacy.md`, `ctx/rules/arch/back.md`, `ctx/rules/arch/env/config.md`, `ctx/rules/arch/env/apache.md`, `ctx/rules/node/bin/server.md`, `ctx/rules/web/infra/storage.md` и соседние окружения/логирование — убрал повторяющиеся инварианты и направил читателя в `ctx/constraints/*`.

## Результаты
- Инварианты реализации собраны в новом уровне `ctx/constraints`, а контекст правил теперь ссылается на них и не повторяет ограничения; автотесты не запускались (документация).
