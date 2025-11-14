# Report on cache-clear UI

## Резюме изменений
- переименовал кнопку `#reset-settings` на `#clear-cache` и обновил экран `enter`/call-flow, чтобы через `HomeCall_Web_Pwa_CacheCleaner$` можно было очищать CacheStorage одновременно с `storage.resetMyData()`;
- зафиксировал в `ctx/rules/...` новую кнопку **«Очистить кэш»**, ее влияние на локальное состояние, и уточнил, кто инициирует ручную очистку в PWA-архитектуре.

## Детали работ
- `web/ui/enter.html` и `web/app/Ui/Screen/Enter.mjs` теперь рендерят кнопку **«Очистить кэш»** и передают `onClearCache` коллбэк;
- `web/app/Core/CallFlow.mjs` подключает `HomeCall_Web_Pwa_CacheCleaner$`, сбрасывает контекст/`storage` и запускает кэш-клинер при нажатии, попутно показывая инфо-toast до перезагрузки;
- документация: `ctx/rules/web/app.md`, `ctx/rules/web/contours/ui.md`, `ctx/rules/web/ui/home.md`, `ctx/rules/web/ui/layout.md`, `ctx/rules/web/ui/screens.md`, `ctx/rules/web/infra/storage.md` переименованы и описывают новое поведение, а `ctx/rules/web/infra/pwa.md` объясняет, как `HomeCall_Web_Core_CallFlow` и `HomeCall_Web_Pwa_CacheCleaner$` координируют ручную очистку.

## Результаты
- `npm run test:web` *(fails: `test/web/app/Ui/Enter.test.mjs` продолжает падать с историческим `'test failed'`; эта проблема наблюдается и на незатронутом дереве, так что здесь она не новая)*.
