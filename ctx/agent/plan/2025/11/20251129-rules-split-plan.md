# Semantic split plan for `ctx/rules/`

GPT-5.1-Codex-Mini has a limited context window, so the `ctx/rules/` corpus must be analysed in digestible batches. The groups below organise the documents thematically; each contains only a handful of files so that Codex can process them without truncation. Later tasks (analysis, mismatch capture, planning) will refer to the numbered groups.

## Group 1 — Architecture foundation (TeqFW, DI, deployment)
**Docs:** `architecture.md`, `arch/structure.md`, `arch/front.md`, `arch/back.md`, `arch/linkage.md`, `arch/logging.md`, `arch/testing.md`, `arch/env/*.md`, `arch/rtc/*.md`, `arch/teqfw/*.md`, `arch/state.md`
**Rationale:** Captures overall system shape, container rules, RTC protocols and deployment parameters. This group is bounded by architecture-level documents that already reference `home → invite → call → end` flows, so we can analyse the high-level contradictions to the product’s single-window model before we drill into UI specifics.

## Group 2 — UI behaviour (PWA entry, logging, layout, components)
**Docs:** `web/AGENTS.md`, `web/app.md`, `web/structure.md`, `web/logging.md`, `web/testing.md`, `web/ui/layout.md`, `web/ui/style.md`, `web/ui/notifications.md`, `web/ui/share-link.md`, `web/ui/page/*.md`, `web/ui/component/*.md`
**Rationale:** Defines how the browser view is composed, styled and logged. The group also includes the share-link narrative conflating invitation and call start, which directly collides with the `ctx/product` mandate for a single window and in-session link generation.

## Group 3 — Contours & WebRTC (media, net, rtc, environment)
**Docs:** `web/contours/core.md`, `env.md`, `media.md`, `net.md`, `rtc.md`, `shared.md`, the `web/infra` folder (`pwa.md`, `ws.md`, `storage.md`)
**Rationale:** Contains the functional contours and infra that coordinate media, signaling, environment discovery and storage. This is the best slot to capture contradictions between the current flow routing (stateful screens) and the product’s transparent stream of states (`ready → waiting → connected`).

## Group 4 — Backend + Node-specific instructions
**Docs:** `node/bin/server.md`, `node/testing.md`, `arch/back.md` (repeat for context), `arch/env/config.md`, `arch/env/node.md`, `arch/env/apache.md`, `arch/env/systemd.md`, `arch/env/logrotate.md`
**Rationale:** Focuses on the server-side entrypoints, configuration, and test policy. We will verify that instructions reflect the product’s “minimal technical state on the server” requirement and the autonomy claims from the overview.

## Group 5 — State machines, flows and screens
**Docs:** `web/ui/screens.md`, `web/ui/screen/*.md`, `arch/state.md`, `web/contours/core.md` (already in Group 3 but referenced here for transitions), `ctx/product/flows/connection.md` (for reference only, read in this analysis batch), `web/app.md`
**Rationale:** Zooms into the documented screen-by-screen flow and the finite-state machine. This is where the single-window principle is explicitly violated, so we will analyse each file to pin down the outdated flow (`home → invite → call → end`) and propose a rephrasing that emphasises the ready/waiting/active cycle described in `ctx/product/capabilities/connection.md`.

## Group 6 — Supporting policy and tests
**Docs:** `codex.md`, `language.md`, `privacy.md`, `web/testing.md`, `node/testing.md`
**Rationale:** Covers policies about language, privacy, test triggers and Codex behaviour. This batch is light, meant for aligning the supporting guidance with the upgraded product story once the major flow/content pieces are refactored.

Each group keeps the document count small enough for a single Codex call. When analysing, focus on antitheses to the updated product model (`overview.md`, `capabilities/*.md`) and note where terminology, screen count, link-handling, or state assumptions must change.
