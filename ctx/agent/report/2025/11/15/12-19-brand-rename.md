# 2025-11-15 12:19 Kolobok brand rename

## Goal
Replace the Domozvon/HomeCall brand with Kolobok across the cognitive layer, frontend, backend, and PWA assets while keeping namespace identifiers unchanged.

## Changes
- reshaped AGENTS/README/product/rules documentation to reference Колобок (русский) and Kolobok (английский) and refreshed all contextual links and descriptions; the namespace-aware references to `HomeCall_*` remained untouched.
- updated the web shell (HTML, manifest, icons), UI text, and service worker to use the Kolobok name and `kolobok-v{version}` caches, plus refreshed `web/version.json` → `20251115-121913` in line with `web/AGENTS.md` requirements.
- kept the DI namespaces as `HomeCall_*` while adjusting backend/log messages, PWA helpers, and tests to mention Kolobok; also updated fixtures that shared `kolobok.app` invite URLs.
- recorded the iteration summary in `ctx/agent/report-brand-rename.md` per the latest request.

## Testing
- `npm run test:unit` *(fails: the signaling server test cannot bind to `127.0.0.1` inside this sandbox and raises `listen EPERM: operation not permitted 127.0.0.1`).*
