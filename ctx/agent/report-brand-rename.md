# report-brand-rename

## Summary
- shifted the root and cognitive documentation from ДомоЗвон/Domozvon/HomeCall to Колобок/Kolobok, updating AGENTS, README, and every `ctx/product/**` and `ctx/rules/**` file while keeping namespace examples untouched.
- refreshed the frontend shell (HTML, manifest, icons), UI copy, PWA cache naming (`kolobok-v*`), and `web/version.json` → `20251115-121913` so the UI now reflects the Kolobok brand.
- kept DI namespaces as `HomeCall_*` but swapped backend logs, helper errors, and test expectations to Kolobok, linking invite URLs to `kolobok.app` and updating PWA/test helpers accordingly.
- recorded this iteration under `ctx/agent/report/2025/11/15/12-19-brand-rename.md` and noted the unit test failure due to the sandbox blocking `127.0.0.1` binding.

## Files touched (representative)
- `README.md`, `AGENTS.md`, `web/AGENTS.md`
- `ctx/AGENTS.md`, `ctx/product/**` (overview, features, scenarios, AGENTS), `ctx/rules/**`
- `web/index.html`, `web/manifest.json`, `web/service-worker.js`, `web/assets/icons/*`, `web/ui/*.html`, `web/app/**/*.mjs`, `web/version.json`
- `src/AGENTS.md`, `src/Back/*.js`
- `test/unit/**/*.test.mjs`, `test/web/app/**/*.test.mjs`
- `ctx/agent/report/2025/11/15/12-19-brand-rename.md`
