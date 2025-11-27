# Logger Timestamp Update

## Резюме изменений
- Console logging now prefixes each message with the current ISO timestamp; remote payloads still use the existing formatter.
- `web/version.json` refreshed to `20251127-052943` to satisfy the web layer versioning rule.

## Детали работ
- Added an ISO timestamp prefix in `HomeCall_Web_Logger.notify` so the timestamp prints locally before the formatted log while leaving `dispatchRemote` unchanged.
- Recorded the new UTC timestamp in `web/version.json` per `web/AGENTS.md`, matching the version noted in this report.

## Результаты
- `npm run test:unit` (tests still fail because `test/unit/Back/Service/Signal/Server.test.mjs` reports `test failed`).
