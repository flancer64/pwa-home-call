# Итерация: серверный bootstrap

## Резюме изменений
- Создан исполняемый bootstrap-скрипт `bin/server.js` для запуска backend HomeCall через контейнер `@teqfw/di`.

## Детали работ
- Загрузил `.env`, настроил пути namespace для `HomeCall_` и `Teqfw_Di_` в контейнере.
- Подключил препроцессор замен `Teqfw_Di_Pre_Replace` для маппинга `HomeCall_Back_Contract_Logger` → `HomeCall_Back_Logger`.
- Получил и запустил приложение `HomeCall_Back_App$`, добавил обработчики сигналов `SIGINT`/`SIGTERM` для корректной остановки.

## Результаты
- Команда `npm start` теперь использует новый bootstrap-скрипт, соответствующий архитектурным требованиям TeqFW и HomeCall.
