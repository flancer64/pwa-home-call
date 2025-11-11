# PWA cache rebuild task

## Цель итерации
- Перейти от механизма переустановки сервис-воркера к управлению кэшем через сообщение и зафиксировать это в документации.

## Действия
- Обновил `VersionWatcher` (web/app/Core/VersionWatcher.mjs) так, чтобы при смене `version.json` он отсылал сообщение `clear-caches-and-rebuild` активному воркеру и логировал факт запуска rebuild-а.
- Внёс в `service-worker.js` обработку этого сообщения: полностью очищаются все кэши, создаётся новый `homecall-v{version}` со всеми `CORE_ASSETS`, обновляется внутренняя версия и выводится информационный лог.
- Переписал описания в `ctx/rules/web/pwa.md`, чтобы архитектура отражала текущую модель: воркер остаётся постоянным, кэш обновляется через message, `VersionWatcher` фиксирует событие и логи соответствуют новой последовательности.

## Результаты
- Кэш теперь полностью пересобирается в рамках одного активного сервис-воркера, нет необходимости вызывать `registration.update()` и `skip-waiting`.
- Добавлены лог-записи:
  - `[VersionWatcher] Triggered cache rebuild for {version}`;
  - `[ServiceWorker] Cache rebuilt for version {version}` (плюс штатный warning при ошибке).
- Документация описывает новый порядок действий для сервис-воркера, наблюдателя и инвариантов.

## Пример работы после обновления `version.json`
- Обновил `web/version.json` до новой метки (`20251111-0022`).
- `VersionWatcher` зафиксировал изменение, вывел:

  ```
  [VersionWatcher] Version change detected: 20251111-0018 → 20251111-0022
  [VersionWatcher] Triggered cache rebuild for 20251111-0022
  ```

- `service-worker.js` принял сообщение, удалил старые кэши, пересобрал `homecall-v20251111-0022`, сел:

  ```
  [ServiceWorker] Cache rebuilt for version 20251111-0022
  ```

