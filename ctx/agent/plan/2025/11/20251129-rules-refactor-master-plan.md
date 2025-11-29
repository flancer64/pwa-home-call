# Master Refactor Plan for `ctx/rules/`

This plan aggregates the insights from the group analyses into a single path for rewriting the `ctx/rules/` corpus so that it matches the updated product model (`overview.md`, `capabilities/*`) while keeping the existing code contracts (`HomeCall_Web_*`, TeqFW DI, WebRTC signaling).

## 1. Remove outdated concepts
- Eliminate any language that presents `home`, `invite`, `call`, and `end` as separate screens in the DOM rather than as **conditional states inside a single view**.
- Remove instructions that require generating the share link before media is ready or that portray the invite phase as a separate page (e.g., `web/ui/share-link.md`, parts of `web/ui/screens.md`).
- Drop duplicated state documentation (`arch/teqfw/state.md` duplicates `arch/state.md`) unless it can be merged into one canonical state reference.

## 2. Rewrite key sections
- **Architecture overview (`architecture.md`, `arch/front.md`)** — reframe the system as a single-window SPA that toggles states `ready → waiting → active` while orchestrating Media/Net/Rtc through the DI container.
- **UI documentation (`web/app.md`, `web/ui/layout.md`, `web/ui/style.md`, `web/ui/component/*`)** — describe components as reusable fragments that show/hide based on the current state instead of as full screens; highlight how to present sharing controls within the “waiting” state.
- **State/flow docs (`web/ui/screens.md`, `web/contours/core.md`, `arch/state.md`)** — formally introduce the product states and map each to the existing DI callbacks, ensuring that `share-link` behavior is described as part of the `waiting` state and that `ready`/`active` transitions (including media preparedness and WebRTC negotiation) are spelled out.
- **Linking docs (`web/ui/share-link.md`, `arch/rtc/signaling.md`, `web/infra/ws.md`)** — clarify that link generation occurs inside the session, the same session is reused when a user opens `?session=<uuid>`, and the server holds the link only while the session is alive.

## 3. Add missing coverage
- Introduce a **state mapping table** (e.g., in `web/ui/screens.md` or `web/contours/core.md`) showing how user input, DI events, and toasts correspond to the `ready/waiting/active` trio.
- Document how the share/link controls surface inside the single window without leaving it (e.g., “waiting overlay” or “link panel”).
- In the architecture docs, add a short section linking the `HomeCall_Web_Ui_Flow` implementation to the state narrative, referencing the actual DI dependencies (Flow, Controller, StateMachine, Toast, ShareLink) so downstream readers can navigate to the code.
- Expand `privacy.md` and `language.md` to mention this new model so the policy layer reinforces the single-window story.

## 4. Update terminology
- Replace repeated references to “screens” with “states” or “variants” (ready, waiting, active) throughout `web/ui` and `arch` docs.
- In share/link sections, replace “invite” with “link-sharing overlay” or “link control” to avoid implying a separate screen.
- Where `sessionId` is described, tie it to the “current session window” rather than to any saved room/invite concept.

## 5. Restructure documentation
- Group `web/ui` content into subsections: (1) behavioural narrative (states & transitions) and (2) visual atoms (components). Avoid mixing both by ensuring `layout.md` and `style.md` only describe presentation, while `screens.md` focuses on trigger conditions for showing different states.
- Move infrastructure details (PWA caching, storage flags) into sections connected to the state machine (e.g., “the storage flags are only consulted when the window reboots and the state resets to `ready`”).
- Add cross-references to `ctx/product/flows/connection.md`, `capabilities/connection.md`, and `capabilities/link-sharing.md` wherever lifecycle language is introduced.

## 6. Keep alignment with `ctx/product/*`
- Always cite `ctx/product/overview.md` when defining value statements (single window, minimal server).
- Quote or paraphrase `capabilities/connection.md` for the state terminology and `capabilities/link-sharing.md` for link behaviour.
- Reference `ctx/product/flows/connection.md` when documenting the high-level path so the rules layer stays anchored to the product level rather than drifting into older multi-screen narratives.

## 7. Maintain the connection to the codebase
- Preserve all TeqFW DI identifiers (`HomeCall_Web_Core_App$`, `HomeCall_Web_Ui_Controller$`, etc.) in the documentation so Codex agents can map text to the existing modules.
- Mention real code artifacts (e.g., `web/app/Ui/Flow.mjs`, `web/app/Ui/Controller.mjs`, `web/app/State/Machine.mjs`, `web/ui/screen/*.html`) whenever describing a state transition, making it easy to find the implementation that needs updating.
- Keep note of the `share-link` helpers (`sessionManager.createSessionId`, `inviteService`) when describing how the link is generated so that rewriting docs will inform the required code adjustments.
