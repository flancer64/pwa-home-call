# Отчёт 2025-11-29 10:50 — переработка ctx/product

## Цель
Преобразовать `ctx/product/` в декларативный уровень, отражающий автономный центр связи, и уточнить требования к document формату и инвариантам.

## Действия
- обновил `ctx/AGENTS.md`, чтобы закрепить обязанность каждого файла уровня `ctx/product` иметь вторую строку `Path:` и подчёркнул роль `overview.md` как источника смысла;
- полностью переписал `ctx/product` (overview, capabilities, capabilities/*, flows/*, terms) и их AGENTS, чтобы исключить UX-избыточность, убрать привязки к пожилым и сделать акцент на автономности, минимальном серверном состоянии и структурной согласованности;
- ввёл стройный формат, где каждое дочернее описание начинается с заголовка, строки пути и декларативного содержания, включая вспомогательные AGENTS.

## Артефакты
- `ctx/AGENTS.md`
- `ctx/product/AGENTS.md`
- `ctx/product/overview.md`
- `ctx/product/capabilities.md`
- `ctx/product/capabilities/AGENTS.md`
- `ctx/product/capabilities/connection.md`
- `ctx/product/capabilities/link-sharing.md`
- `ctx/product/flows/AGENTS.md`
- `ctx/product/flows/connection.md`
- `ctx/product/terms.md`
