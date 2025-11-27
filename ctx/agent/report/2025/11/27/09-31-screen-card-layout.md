## Резюме изменений
- Привёл `screen-card` к требованиям `ctx/rules/web/ui/component/screen-card.md`: карточка ограничена экранной высотой, сохраняет ширинное ограничение, а `main` остаётся центрированным и самостоятельно прокручивается.
- Обновил `web/version.json` → `20251127-092554`, как требует правило обновления веб-сборки.
- Сохранил наблюдение о падении `npm run test:unit` в `test/unit/Back/Service/Signal/Server.test.mjs`.

## Детали работ
- В `web/ui/component/screen-card.css` убрал искусственную высоту `min-height: 100vh`, добавил лимит `max-height: 100vh`, установил `min-height: 0` для флекс-контейнера и включил `overflow-y: auto` для зоны `main` (с сохранением выравнивания по центру).
- Версию PWA обновил в `web/version.json` (UTC `20251127-092554`) — требование из `web/AGENTS.md` для любых правок UI.
- Запустил `npm run test:unit` после финальных корректировок; `test/unit/Back/Service/Signal/Server.test.mjs` продолжает падать совершенно независимо от CSS.

## Результаты
- `screen-card` занимает весь доступный экран, а `main` прокручивается отдельно, не растягивая верх/низ.
- Тестовая команда остаётся зависимой от `test/unit/Back/Service/Signal/Server.test.mjs`.
