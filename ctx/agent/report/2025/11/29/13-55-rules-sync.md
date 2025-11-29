# Документация `ctx/rules/` и план будущих изменений
Path: `./ctx/agent/report/2025/11/29/13-55-rules-sync.md`

## Резюме изменений
- заархивировал текущую ветвь `ctx/rules/` (`backups/ctx-rules-pre-20251129.tar.gz`), добавил карту уровня и семантический split-plan;
- переписал ключевые документы `ctx/rules/architecture.md`, `web/app.md`, `web/contours/*`, `arch/*`, `node/*`, `codex.md`, `language.md`, `privacy.md` и связанные UI/infra/contour файлы, чтобы они ссылались на новую single-window модель (`ready/waiting/active`), отмечая, что текущая реализация всё ещё использует `home → invite → call → end` и указывая на будущий план `20251129-rules-implementation-fixes.md`;
- задокументировал ограничения текущего кода в отдельных `FUTURE PLAN` примечаниях и создал итоговый `ctx/agent/plan/2025/11/20251129-future-code-and-doc-changes.md` с задачами по коду и последующими обновлениями документации.

## Детали работ
- Проанализировал и обновил архитектурные разделы (`architecture.md`, `arch/front.md`, `arch/back.md`, `arch/env/*`, `arch/logging.md`, `arch/testing.md`, `arch/rtc/*`, `arch/state.md`, `arch/teqfw/*`) так, чтобы они ссылались на `ctx/product/overview.md`, `capabilities/*`, `flows/connection.md`, описывали минимальное серверное состояние и объясняли, как текущие `home/invite/call/end` экраны будут реконструированы.
- Пересмотрел браузерные руководства (`web/app.md`, `web/structure.md`, `web/logging.md`, `web/testing.md`, `web/ui/*`, `web/contours/*`, `web/infra/*`, `web/ui/component/*`, `web/ui/page/*`) — все получили блоки, уточняющие связь с продуктовой моделью, ссылку на план `20251129-rules-implementation-fixes.md` и сохранение фактической реализации.
- Подробно описал тестовую и Codex-поведение (`codex.md`, `language.md`, `privacy.md`, `node/testing.md`) и оформили `ctx/agent/plan/...-future-code-and-doc-changes.md` с работами, которые нужно выполнить после кода.

## Результаты
- Документация `ctx/rules/` теперь соответствует продуктовой модели, содержит указания на существующее поведение и отмечает будущий single-window рефакторинг.
- Все изменения ограничены каталого `ctx/rules/` (плюс отчёт и будущий план) — код и `ctx/product/` остались нетронутыми.
- Тесты не запускались: задача касалась только документации и описания будущих шагов.
