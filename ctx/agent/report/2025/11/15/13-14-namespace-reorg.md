# Namespace reorg iteration report

## Goal
- realign the HomeCall web code with the new namespace hierarchy while keeping DI wiring intact.

## Actions
- moved the Core/Shared modules into the new `app/`, `Ui/`, `Net/`, `Pwa/`, `State/`, and `Media/` trees and updated each class/module name accordingly.
- refreshed the DI entry point, typedefs, service-worker cache manifest, and every dependent module to reference the shorter namespace segments and relocate templates, controller, flow, and invite helpers.
- adjusted the affected web tests plus the cache-cleaner spec to the new names, then ran `npm run test:unit` to surface regressions.

## Results
- major modules now live under the requested namespace directories and the DI resolver pulls them from `app/`.
- `npm run test:unit` still fails in `test/unit/Back/Service/Signal/Server.test.mjs` (pre-existing) while the remaining suites pass.
