# patterns-style

## Резюме изменений
- Утвердил `ctx/composition/client/ui/patterns/style.md` как базовую тему и привёл карту паттернов/overview к нему.
- Обновил AGENTS уровня `ui`, `components`, `layout` и `ux`, чтобы они ссылались на новую декларацию и разграничивали области ответственности.
- Привёл компонентные/layout-документы, фасады паттернов и `ctx/composition/overview.md` к общему контексту, добавив ссылки на новую тему.

## Детали работ
- Проверил язык документации, поправил ссылку `Path` и обновил список `Ссылок`, чтобы `style.md` всё время ссылается на реальные layout/компоненты.
- Изменил `generic` выражения в AGENTS `ui`/`components`/`layout`/`ux`, добалив акцент на `patterns/style.md` и напомнив агентам не дублировать цвета, тени или типографику.
- Привёл `big-button`, `header-action-button`, `screen-card`, `screen-header`, `icon-wrapper`, `toast-layer`, `fab-panel`, `layout/overview`, `layout/call`, `layout/skeleton`, `layout/overlays/share-link` к упоминанию новой темы; пересмотрел `ctx/composition/client/ui/components/style.md`, сделав его вспомогательным описанием применения токенов.
- Обновил `ctx/composition/overview.md`, чтобы структура `client/ui` и `patterns` отражали новую визуальную декларацию.

## Результаты
- `patterns/style.md` зафиксирована как единый визуальный контур для ui/компонентов и паттернов, без избыточных деклараций на других уровнях.
- Интерфейсные AGENTS и связанные документы согласованы: теперь все ссылки указывают на ту же тему и ограничивают повторное описание палитры/тени/типографики.
