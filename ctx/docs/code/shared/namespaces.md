# Пространство имён и файловая структура

Path: `./ctx/docs/code/shared/namespaces.md`

Код проекта располагается в чётко определённых каталогах с привязкой namespace к пути файла.

- `bin/` содержит стартовые программы (`bin/server.js`) и helper-скрипты, которые подготавливают контейнер и запускают `src/Back/App.mjs`.
- `src/Back/` — Node.js-реализация серверных модулей. Здесь живут `App`, `Logger`, `Service/Signal` и другие компоненты, экспортирующие namespace `HomeCall_Back_*`.
- `web/app/` содержит клиентский код: `Core`, `Ui`, `Media`, `Net`, `Pwa`, `Env`, `State`, `Logger`, `VersionWatcher`. Каждый файл экспортирует namespace `HomeCall_Web_*`, который повторяет путь (например, `web/app/Net/Signal/Client.mjs` → `HomeCall_Web_Net_Signal_Client`).
- `web/service-worker.js`, `web/app/Pwa` и связанные статические ресурсы обслуживают PWA-инфраструктуру и остаются внутри клиентского контура.
- `test/unit/` и `test/web/` зеркально повторяют `src/` и `web/app/` для модульных тестов; автозагрузка тестов проводится через `npm run test:unit` и `npm run test:web`.
- `ctx/` и `ctx/docs/code` отвечают за документы ADSM и не участвуют в namespace кода.

Правила namespace:

1. Каждое имя модуля начинается с `HomeCall_Back_` или `HomeCall_Web_`, за которым следует набор сегментов, соответствующих директориям и поддиректориям (`HomeCall_Web_Ui_Toast`, `HomeCall_Back_Service_Signal_Server`).
2. Namespace включает суффикс `$` при регистрации в DI (`HomeCall_Web_Ui_Toast$`).
3. Изменение расположения файла требует обновления namespace в контейнере и тестах, чтобы `resolver` находил модуль по новому пути.
4. `test/` каталоги используют ту же namespace-логику, но с префиксом тестов, чтобы helper-ы могли зарегистрировать mock-версии (например, `test/unit/Back/Service/Signal/Server.test.mjs` импортирует namespace `HomeCall_Back_Service_Signal_Server$` через контейнер).

Следите, чтобы namespace оставался один к одному с файловой структурой: если `web/app/Media/Manager.mjs` переходит в новую директорию, обновите namespace и `container.getResolver().addNamespaceRoot` в `bin/server.js`.
