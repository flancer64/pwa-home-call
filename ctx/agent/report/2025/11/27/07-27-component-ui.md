# Компоненты UI и новая архитектура экранов

## Резюме изменений
- заменил `web/assets/style.css` на `ui/ui.css`, перенёс глобальные переменные/фон и зарегистрировал новый компонентный слой (`web/ui/component/*`) с Shadow DOM для карточек, заголовков, заметок, кнопок и иконок;
- переписал все шаблоны `web/ui/*.html` (кроме `call`) так, чтобы они использовали `screen-card`, `screen-header`, `big-button`, `screen-note` и `icon-wrapper`, убрал дублирование классов и вернулся к трёхзонной структуре из документации;
- сохранил особый экран `call` вместе с собственным layout/фабами и иконками, обновил `web/app/Ui/Screen/*` и `test/web/.../Home.test.mjs` под новую разметку, а также подключил компонентную шину из `index.html` и `service-worker.js`.

## Детали работ
- реализовал `icon-wrapper`, `big-button`, `screen-header`, `screen-note`, `screen-card` с независимыми CSS-файлами, зарегистрировал их через `web/ui/component/components.js` и отразил в кэширующем `service-worker`;
- адаптировал шаблоны `home`, `invite`, `end`, `settings` к новым API: `screen-note` получает статичный текст, `invite` управляет CTA и ссылкой через `big-button`, `settings` и `end` эксплуатируют слоты `slot="action"/"meta"`, `call.html` сохранил уникальную компоновку и FAB-кнопки с `icon-wrapper`;
- обновил UI-экраны (`web/app/Ui/Screen/*`) и тесты так, чтобы логика продолжала работать без старых классов (например, `Home` больше не предлагает кнопку настроек, `invite` манипулирует иконками внутри `big-button`, `end` пишет значение `connectionMessage` в `screen-note`).

## Результаты
- `web/version.json` → `20251127-072628` (UTC-метка обновлена вместе с изменениями web/);
- `npm run test:unit` (фейлится на `test/unit/Back/Service/Signal/Server.test.mjs` с историческим сообщением `"test failed"`, это блокировало сборку и до этой итерации).
