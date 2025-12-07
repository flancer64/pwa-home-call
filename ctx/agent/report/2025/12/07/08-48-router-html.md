# Отчёт по привязке шаблонов Router
Path: `./ctx/agent/report/2025/12/07/08-48-router-html.md`

## Цель
Обновить описание путей шаблонов и рабочие артефакты так, чтобы Router и TemplatesLoader ссылались на единичные HTML-файлы в `web/ui/screens/`.

## Действия
- Перенёс шаблоны `home`, `invite`, `call`, `end` и `not-found` непосредственно в `web/ui/screens/`, удалив пустые подкаталоги.
- Адаптировал `HomeCall_Web_Ui_Templates_Loader` и `web/service-worker.js` к новым относительным путям `ui/screens/<screen>.html`.
- Обновил `routes.md`, чтобы пример указывал на новое расположение, не фиксируя при этом правила разнесения.

## Артефакты
- `web/ui/screens/{home,invite,call,end,not-found}.html`
- `web/app/Ui/Templates/Loader.mjs`
- `web/service-worker.js`
- `ctx/composition/client/ui/routing/routes.md`
