# App test root fix

## Goal
- remove the redundant `app/app` path from the web UI tests so they mirror the actual module layout.

## Actions
- moved `test/web/app/app/App.test.mjs` to `test/web/app/App.test.mjs` and now import `createWebContainer` via `../helper.mjs`.
- confirmed the only failing unit test remains `test/unit/Back/Service/Signal/Server.test.mjs`, which was already failing before this change.

## Results
- `test/web/app` no longer contains a nested `app` directory and the App test sits beside the production module it validates.
- `npm run test:unit` still fails on the pre-existing Signal server spec; all Web UI tests pass.
