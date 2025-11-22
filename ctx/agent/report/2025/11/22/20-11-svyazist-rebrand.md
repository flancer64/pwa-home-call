# Goal
- Rebrand the web client from Колобок to Связист and ensure all web-layer assets, metadata, and runtime strings consistently advertise the new product name.

# Actions
- Updated the UI pages, manifest, SVG icons, and invite share payload to show «Связист» wherever the old brand appeared.
- Swapped Kolobok references in the JS modules, logs, and service worker to the new brand (`Svyazist` in English-facing strings, `svyazist` cache prefixes) and pointed the session URL fallback to `https://svyazist.app`.
- Refreshed `web/version.json` → `20251122-201106` to satisfy `web/AGENTS.md`’s release version rule.

# Artifacts
- Updated HTML, manifest, SVG icons, JS modules, `web/service-worker.js`, `web/AGENTS.md`, and `web/version.json` to reflect the rebrand and new cache prefix.

# Instructions
- AGENTS.md
- web/AGENTS.md
