# Отчёт агента — 29 ноября 2025

## Цель
Мигрировать корпус документации `ctx/product/` под новую модель звонка «Связать → звонок → ссылка внутри сеанса», сохранив смысл и интегрировав старые материалы.

## Выполнено
- Переименовал каталоги и документы (`features` → `capabilities`, `scenarios` → `flows`, `features.md` → `capabilities.md`) и обновил `AGENTS.md` на соответствующих уровнях.
- Создал новые спецификации в `capabilities/connection.md`, `capabilities/link-sharing.md`, `flows/connection.md` и интегрировал в них информацию из старых файлов.
- Переписал `overview.md`, `capabilities.md` и `terms.md`, учёл новую модель взаимодействия, уточнил ссылку приглашения и определил устаревшее поведение.
- Удалил устаревшие файлы (`invite.md`, `primary-call.md`, `first-run.md`, `daily-use.md`) после переноса содержания и зафиксировал последовательность потоков.

## Артефакты
- `ctx/product/overview.md`
- `ctx/product/capabilities.md`
- `ctx/product/capabilities/connection.md`
- `ctx/product/capabilities/link-sharing.md`
- `ctx/product/flows/connection.md`
- `ctx/product/terms.md`
