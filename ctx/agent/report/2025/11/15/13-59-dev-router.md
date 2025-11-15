# 13-59 DevRouter integration

## Цель итерации
- подключить `HomeCall_Web_Ui_Router_Dev$` к жизненному циклу приложения, ограничив запуск флагом `HomeCall_Web_Env_Provider.isDevelopment`, и закрепить поведение через тесты и документацию.

## Действия
- расширил `HomeCall_Web_Env_Provider` и `HomeCall_Web_App`, чтобы `isDevelopment` определялся по `NODE_ENV` и «dev»/`local` хостам, а `DevRouter` инициализировался только при true.
- обеспечил безопасный старт маршрутизатора (обёртка `startDevRouter`, отдельный вызов при неудачном сигнале, лог ошибок) и добавил типизацию доступа через `types.d.js`.
- написал юнит для `HomeCall_Web_Ui_Router_Dev$`, проверяющий первый и последующий хеши, привязку listener`а и передачу параметров.
- уточнил `ctx/rules/web/contours/ui.md`, зафиксировав автоматическую инициализацию DevRouter и условия, при которых пользователи его не видят.

## Качество документации (семь критериев ADSM)
- `ctx/rules/web/contours/ui.md`: Declarative ✅, Complete ✅, Consistent ✅, Connected ✅, Dense ✅, Compact ✅, Non-redundant ✅.

## Тесты
- `npm run test:web`
