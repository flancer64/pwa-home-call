# Отчёт итерации

## Цель
Перенести актуальные архитектурные декларации из "свалки" `ctx/rules/` в новый архитектурный уровень `ctx/architecture/`, зафиксировать новые правила и защитить связи с `product/` и `constraints/`.

## Действия
- Подготовил каталог `ctx/architecture/` с `AGENTS.md`, переходящим на декларативный стиль, и пятью документами (`overview`, `client`, `server`, `messaging`, `lifecycle`), каждый из которых явным образом ссылается на `product` и `constraints`.
- Архивировал старые документы (`ctx/rules/architecture.md`, `ctx/rules/arch/{back,front,state,logging,linkage}`, `ctx/rules/arch/rtc/{signaling,media-flow}`, `ctx/rules/arch/teqfw/state.md`) под `ctx/_archive/architecture/` и перенаправил ссылки окружений Apache/Node на новый обзор.
- Обновил `ctx/agent/AGENTS.md` и `ctx/rules/arch/teqfw/*` так, чтобы указанные ссылки велись на `ctx/architecture/overview.md`.

## Результаты
- Архитектурный уровень получил декларативные документы о фронтенде, сервере, сигналингe и жизненном цикле, согласованные с `product/` и `constraints/`.
- Старая документация теперь доступна в `ctx/_archive/architecture/`, ссылки окружений Apache/Node актуальны.
- Контекстные указатели (`ctx/agent/AGENTS.md`, `ctx/rules/arch/teqfw/di.md`, `ctx/rules/arch/teqfw/module-template.md`) обновлены под новую структуру.

## Тесты
- Не выполнялись (документирование архитектуры).
