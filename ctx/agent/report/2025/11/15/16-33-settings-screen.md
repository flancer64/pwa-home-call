# 16:33 — реализовал экран «Настройки»

## Цель итерации
- воплотить экран «Настройки» точно по описанию в `ctx/rules/web/ui/screens/settings.md`
- интегрировать его в UI-контроллер, переход с домашнего экрана и систему состояния
- обеспечить кнопку переустановки, которая очищает данные и перезагружает приложение

## Действия
- подготовил шаблон `web/ui/settings.html`, дополнил глобальные стили и реализовал экран `HomeCall_Web_Ui_Screen_Settings$`, который вызывает `HomeCall_Web_Pwa_Cache$`
- расширил контроллер, потоки, стан машин и дев-роутер, чтобы домашний экран мог открывать карточку и возвращаться через FAB-крестик
- добавил юнит-тесты для контроллера, роутера и нового экрана, чтобы зафиксировать навигацию и вызов очистки кэша

## Результаты
- `web/ui/settings.html`, `web/assets/style.css`
- `web/app/Ui/Screen/Settings.mjs`, `web/app/Ui/Controller.mjs`, `web/app/Ui/Flow.mjs`, `web/app/Ui/Router/Dev.mjs`, `web/app/State/Machine.mjs`, `web/app/types.d.js`
- `test/web/app/Ui/Controller/Controller.test.mjs`, `test/web/app/Ui/Router/Dev.test.mjs`, `test/web/app/Ui/Settings.test.mjs`
- Тесты: `node --test test/web/app/Ui/Controller/Controller.test.mjs test/web/app/Ui/Router/Dev.test.mjs test/web/app/Ui/Settings.test.mjs`
