# Inventory of `ctx/rules/`
Path: `./ctx/rules/inventory.md`

This document mirrors `ctx/agent/plan/2025/11/20251129-rules-inventory.md` and gives agents a quick map of the `ctx/rules/` tree.

## Root-level declarations
- `AGENTS.md` — inbound instructions and the level map for `ctx/rules/`.
- `architecture.md` — high-level architecture narrative that ties TeqFW, the DI container, the single-window client, and the backend deployment story into one picture while linking to the product vision in `ctx/product/overview.md`.
- `codex.md` — guidance on how the cognitive layer should seed code generation, keeping product constraints in mind.
- `language.md` — policy for code/comments (English) and UI/notifications (Russian), along with privacy-safe phrasing.
- `privacy.md` — reiteration of the promise not to store personal data, only ephemeral technical metadata tied to the current session.
- `inventory.md` — this map so agents can understand `ctx/rules/` without directory scans.
- `split-plan.md` — the semantic grouping plan (`20251129-rules-split-plan`) that organises the corpus into analysis-friendly batches.
- `backups/` — archived archives like `ctx-rules-pre-20251129.tar.gz` containing the pre-rewrite state of `ctx/rules/`.

## `arch/` (architecture, environments, state)
- `structure.md` — filesystem layout guidance for TeqFW, the Node process, static frontend, data folder, and shared AGENTS.
- `front.md`, `back.md`, `linkage.md`, `logging.md`, `testing.md` — describe how the frontend/back orchestrate and how TeqFW boxes (Core, Media, Net, Rtc, Shared) implement the flow inside a single process.
- `env/*.md` (config, apache, node, systemd, logrotate) — deployment parameters, `.env` requirements, Apache proxy snippets, Node runtime settings, and service/log rotation guidance with the minimal server promise.
- `rtc/` (`signaling.md`, `media-flow.md`) — signalling and media specs for the WebRTC session lifecycle.
- `teqfw/` (`di.md`, `module-template.md`, `state.md`) — DI rules, module templates, and the shared state-machine template that is reused across TeqFW modules.
- `state.md` — project-level state patterns for automata objects and how Core toggles states (currently `home/invite/call/end`, but future plans rename them to `ready/waiting/active`).

## `node/` (backend runtime)
- `node/bin/server.md` — entrypoint composition, loading `.env`, and wiring the DI container.
- `node/testing.md` — Node-specific test policy mirroring `arch/testing.md` and emphasising minimal state.

## `web/` (browser/PWA)
- `web/AGENTS.md` — level map for the browser documentation.
- `web/app.md` — how the client orchestrates Core, Media, Net, Rtc and what the current `home → invite → call → end` flow looks like before the single-window refactor.
- `web/structure.md`, `web/logging.md`, `web/testing.md` — the SPA structure, logging safeguards, and the DI-friendly testing directives.
- `web/infra/` — coverage of PWA infra (`pwa.md`), WebSocket signalling (`ws.md`), and storage (`storage.md`).
- `web/contours/` — contour-by-contour declarative rules for `core`, `env`, `media`, `net`, `rtc`, `shared`, `ui`. Each document lists DI contracts, callbacks, and the portion of the flow it owns.
- `web/ui/layout.md`, `web/ui/style.md`, `web/ui/notifications.md`, `web/ui/share-link.md`, `web/ui/screens.md` — describe the layout, style, toast policy, link-sharing overlay, and screen/state transitions.
- `web/ui/screen/` — per-screen docs (`home`, `invite`, `call`, `end`, `settings`) plus overlays describing what each state renders within the single-window card.
- `web/ui/component/` — component-level guides (`big-button`, `screen-card`, `screen-header`, `screen-note`, `icon-wrapper`, `header-action-button`) explaining the visual atoms and how they show/hide per state.
- `web/ui/page/` — infrastructure pages (`index`, `reinstall`) describing entry/recovery flows.

## Supporting documents
- `web/ui/notifications.md` — toast-only status policy referenced by all UI states.
- `web/ui/page/reinstall.md` & `index.md` — bootstrapping/recovery pages.
