# Semantic split plan for `ctx/rules/`
Path: `./ctx/rules/split-plan.md`

This document reuses `ctx/agent/plan/2025/11/20251129-rules-split-plan.md` to describe the same groups inside the rules level. It is provided so that agents working inside `ctx/rules/` understand how the corpus is partitioned without scanning every directory.

## Group 1 — Architecture foundation (TeqFW, DI, deployment)
**Docs:** `architecture.md`, `arch/structure.md`, `arch/front.md`, `arch/back.md`, `arch/linkage.md`, `arch/logging.md`, `arch/testing.md`, `arch/env/*.md`, `arch/rtc/*.md`, `arch/teqfw/*.md`, `arch/state.md`
**Focus:** High-level architecture, DI contracts, RTC protocols, and deployment details that frame the `home → invite → call → end` flow while positioning it against the single-window product story.

## Group 2 — UI behaviour (PWA entry, logging, layout, components)
**Docs:** `web/AGENTS.md`, `web/app.md`, `web/structure.md`, `web/logging.md`, `web/testing.md`, `web/ui/layout.md`, `web/ui/style.md`, `web/ui/notifications.md`, `web/ui/share-link.md`, `web/ui/page/*.md`, `web/ui/component/*.md`
**Focus:** Browser layout, shared logging, stateful components, and the share-link narrative that must be rephrased to fit the single-window narrative.

## Group 3 — Contours & WebRTC (media, net, rtc, environment)
**Docs:** `web/contours/core.md`, `env.md`, `media.md`, `net.md`, `rtc.md`, `shared.md`, `web/infra/*`
**Focus:** The functional contours, including WebRTC and infrastructure, that coordinate media, signaling, and storage within the state machine.

## Group 4 — Backend + Node-specific instructions
**Docs:** `node/bin/server.md`, `node/testing.md`, `arch/back.md`, `arch/env/*.md`
**Focus:** Server-side entry, configuration, and tests, especially how they keep only ephemeral session state.

## Group 5 — State machines, flows and screens
**Docs:** `web/ui/screens.md`, `web/ui/screen/*.md`, `arch/state.md`, `web/contours/core.md`, `web/app.md`
**Focus:** The concrete screen/state transitions, where the single-window, stateful view must replace the legacy multi-screen narrative.

## Group 6 — Supporting policy and tests
**Docs:** `codex.md`, `language.md`, `privacy.md`, `web/testing.md`, `node/testing.md`
**Focus:** Policies around language, privacy, Codex prompts, and tests that reinforce the new lifecycle.

Each group is sized so that a Codex agent can process the documents without overwhelming the context window. Use these buckets as a checklist when revising `ctx/rules/` to match `ctx/product/*` while still documenting the current implementation.
