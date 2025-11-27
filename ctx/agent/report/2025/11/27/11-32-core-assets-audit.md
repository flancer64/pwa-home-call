# CORE_ASSETS coverage audit

## Резюме изменений
- Проверил файл `web/service-worker.js`, чтобы убедиться, что `CORE_ASSETS` отражает все файлы статического каталога `web/` (исключая `AGENTS.md`).
- Контекстных изменений не делал и версию `web/version.json` не касался.

## Детали работ
- Собрал список всех файлов внутри `web/`, исключив `AGENTS.md` и само `service-worker.js`.
- Сравнил этот набор с тем, что попадает в `CORE_ASSETS` (объединение `STATIC_ASSETS` и `MODULE_ASSETS`).
- Выявил 24 путей, которые отсутствуют в `CORE_ASSETS`, хотя лежат в каталоге `web/`:
  - `app/Config/RemoteLogging.mjs`
  - `app/Ui/Router/Dev.mjs`
  - `app/Ui/Screen/Settings.mjs`
  - `app/types.d.js`
  - 18 svg из `assets/icons/` (alert-triangle, camera-off, camera, close, copy, help-circle, link, menu, mic-off, mic, phone, refresh-ccw, return-home, rss, settings, share, slash, trash-2, video)
  - `version.json`

## Результаты
- `CORE_ASSETS` не покрывает текущую файловую структуру статического каталога `web/`; кроме двух иконок и 21 модуля, остальные файлы в `web/` не упоминаются в кэше.
- В списке отсутствуют дополнительные иконки, `version.json`, `app/types.d.js`, `app/Config/RemoteLogging.mjs`, `app/Ui/Router/Dev.mjs` и `app/Ui/Screen/Settings.mjs`.
- Дальнейшее действие: либо расширить `CORE_ASSETS`, либо уточнить границы статического набора, чтобы исключить найденные файлы.
