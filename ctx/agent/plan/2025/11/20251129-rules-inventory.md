# Inventory of `ctx/rules/`

This is the map requested in the task: it describes each branch of the `ctx/rules/` tree, the kinds of documents present, and their focus so an agent can navigate the space without scanning the filesystem again.

## Root-level declarations
- `AGENTS.md` — inbound instructions for this level (maps `arch/`, `node/`, `web/`, and the policy documents).
- `architecture.md` — high-level architecture brief that ties the TeqFW-based Back, modular Front, DI container, environments, and update story into a single narrative.
- `codex.md` — guidance on how the cognitive layer (agents/Codex) should seed code generation decisions.
- `language.md` — language policy: code/logs in English, UI/notifications in Russian, no personal data strings.
- `privacy.md` — asserts that no persons are profiled, only ephemeral technical metadata is kept.
- `output.md` — generated artifact that can be ignored by agents (non-contextual output placeholder).

## `arch/` (core architectural contours)
- `structure.md` — file layout expectations for the TeqFW project (node process, static `web/`, data folder, shared AGENTS).
- `front.md`, `back.md` — describe the roles and orchestration inside the modular Frontend and monolithic Backend, including the flow `home → invite → call → end`.
- `linkage.md` and `env/*.md` (`config`, `apache`, `node`, `systemd`, `logrotate`) — connect the high-level architecture to concrete deployment parameters, `.env` variable rules, Apache proxy snippets, Node runtime requirements, and systemd/logrotate expectations.
- `logging.md` — logging contract shared between Front and Back, including remote logging toggles and format.
- `testing.md` — overarching testing expectations, with pointers to `node/testing.md` and `web/testing.md`.
- `rtc/` (`signaling.md`, `media-flow.md`) — signal and media protocols for a two-party WebRTC session.
- `teqfw/` (`di.md`, `module-template.md`, and a copy of `state.md`) — container/DI principles, module template, and state-machine template used across the TeqFW stack.
- `state.md` (outside `teqfw/`) — project-level state patterns for automata objects.

## `node/` (backend runtime instructions)
- `node/bin/server.md` — rules for generating the `bin/server.js` composition root, loading `.env`, and wiring `@teqfw/di`.
- `node/testing.md` — Node-specific test policy that mirrors `arch/testing` but adds helper usage and container initialization details.

## `web/` (browser/PWA instructions)
- `web/AGENTS.md` — level map for the browser documentation.
- `web/app.md` — overview of the client-side app, its `home → invite → call → end` cycle, session initialization, PWA expectations, and toast-driven notification practice.
- `web/structure.md`, `web/logging.md`, `web/testing.md` — static layout, logging behavior within the PWA, and frontend testing invariants (DI-only imports, helper-based containers).
- `web/infra/` — PWA infra (`pwa.md`), WebSocket signaling (`ws.md`), storage rules (`storage.md`).
- `web/contours/` — contour-by-contour declarative rules for `core`, `env`, `media`, `net`, `rtc`, `shared`, `ui`.
  - Each contour document lists the DI contracts, callbacks, and the subset of the flow it owns.
- `web/ui/layout.md`, `style.md`, `notifications.md`, `screens.md` — describe the three-zone layout, visual system, toast queue, and screen transitions.
- `web/ui/screen/` — dedicated screen documents (`home`, `invite`, `call`, `end`, `settings`) plus overlays that detail what each stage renders inside the three-zone card.
- `web/ui/component/` — component-level guides (`big-button`, `screen-card`, `screen-header`, `screen-note`, `icon-wrapper`, `header-action-button`) explaining the visual atoms.
- `web/ui/share-link.md` — link generation/sharing logic for the invite stage.
- `web/ui/page/` — infrastructure pages (`index`, `reinstall`) describing entry/recovery flows.

## Supporting documentation
- `ctx/rules/web/ui/notifications.md` — toast-only status policy referenced by all screens.
- `ctx/rules/web/ui/page/reinstall.md` & `index.md` — bootstrapping/recovery pages.

The above inventory covers every document under `ctx/rules/` with its declared purpose, so future work can locate the right files quickly before rewriting or auditing alignment with the product model.
