## Резюме изменений
- Карта уровня `ctx/architecture/AGENTS.md` теперь идёт сразу после Назначения и описывает только актуальные узлы (`web/` плюс AGENTS, client, lifecycle, messaging, overview, server).
- Аналогично обновлены `ctx/architecture/web/AGENTS.md`, `ctx/architecture/web/infra/AGENTS.md` и `ctx/architecture/web/contours/AGENTS.md`, чтобы их карты отражали текущие документы и находились рядом с Назначением.

## Детали работ
- `ctx/architecture/AGENTS.md` — перенёс карту к началу, убрал ссылки на несуществующие окружения/legacy-справку и перечислил только действительные файлы уровня.
- `ctx/architecture/web/AGENTS.md` — привёл описание к двум существующим каталогам (`contours/`, `infra/`) и добавил саму AGENTS-страницу в карту, исключив устаревший `app.md`.
- `ctx/architecture/web/infra/AGENTS.md` — сжал карту до актуальных файлов (`AGENTS.md`, `pwa.md`, `ws.md`) и разместил её сразу после Назначения.
- `ctx/architecture/web/contours/AGENTS.md` — убрал разделитель между Назначением и картой, оставив список всех контурных документов без лишних пробелов.

## Результаты
- Документы теперь описывают фактическую структуру `ctx/architecture` и удовлетворяют правилу «Карта уровня ближе к началу»; тесты не запускались (только документация).
