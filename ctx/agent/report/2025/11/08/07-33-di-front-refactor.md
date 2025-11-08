# Резюме изменений
- Перенёс фронтенд HomeCall на модульную архитектуру `@teqfw/di` с разбиением на область Core/Media/Net/Rtc/Ui.
- Настроил новый composition root, DI-названия и тестовый слой для браузерных модулей.
- Обновил скрипт unit-тестов и заменил устаревшие реализации WebRTC/WebSocket-клиентов.

# Детали работ
- Созданы модули в `web/app/**` для App, ServiceWorkerManager, VersionWatcher, TemplateLoader, Media.Manager/DeviceMonitor, Net.SignalClient, Rtc.Peer и UI экранов. Каждый модуль реализован в стиле closure для совместимости с `@teqfw/di`.
- Переписан `web/app.js` для загрузки контейнера с CDN, регистрации глобальных зависимостей и запуска приложения.
- Удалены монолитные файлы `web/app.js` (старый), `web/ws/client.js`, `web/rtc/peer.js` и тест `test/unit/Web/PrepareMedia.test.mjs`.
- Добавлены node-тесты для фронтенда (`test/web/...`) с helper, проверяющие Core.App, Media.Manager и Ui.Screen.Enter, включая mock контейнера и глобальных API.
- Внесены правки в `package.json`, чтобы `npm run test:unit` выполнял `node --test test/unit` без сбоев.

# Результаты
- `npm run test:unit` — успешно.
- `node --test test/web` — успешно.
