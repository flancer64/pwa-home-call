# Header Action Button

## Резюме изменений
- Внедрил новый компонент `header-action-button`, который централизует зелёную градиентную кнопку в зоне `header` и автоматически добавляет размер, тень и прозрачный фон.
- Перенёс все `screen-header`-действия (home, invite, settings) на новый компонент, оставив API `aria-label`/`id`, обновил `components.js` и кэш сервисного работника.
- Задокументировал атом в `ctx/rules/web/ui/component`, обновил `web/version.json` → `20251127-115741` и зафиксировал версию в отчёте.

## Детали работ
- Добавил `web/ui/component/header-action-button.*`, описал слоты и атрибуты, обработку `disabled`, а также стили с градиентом `#38c884 → #188051` и глубокой тенью.
- Обновил `home.html`, `invite.html`, `settings.html` так, чтобы действие в `screen-header` работало через `<header-action-button>` с вложенным `icon-wrapper`; контроллеры продолжили ловить `click` по старым идентификаторам.
- Зарегистрировал компонент в `web/ui/component/components.js` и включил файлы в `web/service-worker.js`, чтобы новая CSS/JS кэшировались вместе со сборкой.
- Добавил описание компонента в `ctx/rules/web/ui/component/header-action-button.md` и перечислил его в карте уровня `ctx/rules/web/ui/component/AGENTS.md`.

## Результаты
- Home/Invite/Settings теперь полностью используют одноимённый компонент для actions, что удовлетворяет требованиям по доступности и визуальному ритму.
- `web/version.json` синхронизирован с последними правками (`20251127-115741`), сервисный работник кэширует все нужные ресурсы.
