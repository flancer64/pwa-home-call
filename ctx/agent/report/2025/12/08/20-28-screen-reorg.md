# Отчёт по итерации Screens restructuring

## Резюме изменений
- Упорядочил runtime-экраны: все HTML-файлы теперь живут в `web/ui/screen/`, TemplatesLoader и ServiceWorker подхватывают новые пути, а старый каталог `web/ui/screens/` удалён.
- Переименовал share-помощник в `ShareLinkService`, обновил DI/Flow/типизации и маршруты, чтобы больше не ссылаться на `invite`.
- Привёл конфигурационные и композиционные документы к новой структуре, включая `routes.md`, `router.md`, AGENTS и экранные описания без `invite`.

## Детали работ
- переместил `home`, `call`, `end`, `not-found` в `web/ui/screen/`, удалил `web/ui/screens/` и обновил `HomeCall_Web_Ui_Templates_Loader`, ServiceWorker и конфигурацию маршрутов к новым относительным путям;
- переименовал `web/app/Ui/InviteService.mjs` → `ShareLinkService.mjs`, обновил `web/app/types.d.js`, Flow-инъекцию и описания из `ctx/code` под новое имя и экспорт;
- в `ctx/composition/client/ui/routing/` убрал упоминания отдельного маршрута `invite` и прописал `ui/screen/<name>.html`, а `ctx/composition/client/ui/screens/` получил новые документы `call.md`/`not-found.md`, обновлённую карту уровня и удалён `invite.md`, включая поправку `header-action-button`;
- остальная композицонная карта (`ctx/composition/client/AGENTS.md`, `ctx/composition/client/ui/AGENTS.md`) теперь описывает только фактические экраны и overlays;
- обновил `web/version.json` до нового UTC-тimestamp `20251208-202933`.

## Результаты
- Runtime-ссылки больше не указывают на `ui/screens`, маршруты и TemplatesLoader работают исключительно с `ui/screen/<name>.html`.
- В документации остались только экраны `home`, `call`, `end`, `not-found` и overlay `settings`, а `invite` удалён из описаний и карт уровней.
- Версия `web/version.json` отражает новую сборку после внесённых изменений.
