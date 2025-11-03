# Обновление маршрута сигналинга `/signal`

## Резюме изменений
- Перенастроены фронтенд и backend HomeCall на использование WebSocket-пути `/signal`.
- Обновлена архитектурная документация и конфигурация Apache для нового маршрута.
- Актуализированы unit-тесты и скрипт `npm run test:unit` для проверки нового пути.

## Детали работ
- Обновил `web/app.js` и `web/ws/client.js`, чтобы клиент WebSocket подключался к `wss://<host>/signal` без лишних слэшей и валидировал URL.
- Настроил `HomeCall_Back_Service_Signal_Server` на приём соединений по пути `/signal` и уточнил журнальные сообщения.
- Изменил тест `test/unit/Back/Service/Signal/Server.test.mjs`, чтобы проверять успешное подключение по новому пути.
- Скорректировал документацию в `ctx/rules/arch/back/signal.md`, `ctx/rules/arch/back.md`, `ctx/rules/arch/env/apache.md`, `ctx/rules/web/ws.md`.
- Обновил `package.json`, чтобы `npm run test:unit` выполнял `node --test test/unit` и запускал все модульные тесты.

## Результаты
- Команда `npm run test:unit` завершается успешно и покрывает все связанные тесты.
- Фронтенд, backend и прокси Apache используют единый путь `/signal`.
