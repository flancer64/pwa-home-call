# Rules Analysis: Architecture Foundation

## Scope
- `architecture.md`
- `arch/structure.md`
- `arch/front.md`
- `arch/back.md`
- `arch/linkage.md`
- `arch/logging.md`
- `arch/testing.md`
- `arch/env/*.md`
- `arch/rtc/*.md`
- `arch/teqfw/*.md`
- `arch/state.md`

## Existing narrative
The architecture-level documents still present **the system as a TeqFW-powered orchestrator of the `home → invite → call → end` path**. `architecture.md` and `arch/front.md` describe the Front/Back boundaries, the DI namespace, and the screen transitions as if they were independent pages. Deployment docs (`arch/env/*`, `arch/back.md`) repeat this flow when describing how Core, Media, Net, and Rtc come online, while the RTC specs embed the same session lifecycle inside the signaling/media narratives.

## Gap against the updated product model
- `ctx/product/overview.md` says the product is “a private, self‑contained node of communication” with **a single window** in which the initiator stays, shares a link, and runs the entire session (all in the same URL). The current architecture narrative still leans on separate screens and invitations (`home` creates a link, then `invite` is shown, etc.), which obscures how the UI should collapse into one dynamic state machine.
- `ctx/product/capabilities/connection.md` highlights the states **ready → waiting → active** as the true lifecycle, whereas `arch/state.md` and several docs reify `home/invite/call/end` as separate UI artifacts. This misalignment risks fueling code that keeps instantiating new screen modules instead of toggling stateful sections within a single view.
- Even though `arch/rtc` and `arch/signaling` follow the correct `sessionId` protocol, the architecture overview never ties them back to the “transparent moments” from the product overview: initiating the signaling session should be described as part of the same window’s session, not a separate “call” screen.
- The multi-document DI guidance (`arch/teqfw/di.md`, `module-template.md`) already uses the same identifiers as the code (e.g., `HomeCall_Web_Core_App$`). Any rewrite must preserve those names while shifting the storytelling toward the new single-window, minimal-state picture.

## Required adjustments
1. Reframe `architecture.md`/`arch/front.md` to treat `home/invite/call/end` as **transitions of a single-app state machine** rather than literal screens; mention `capabilities/connection.md` and `flows/connection.md` so the architecture narrative aligns with the product lifecycle.
2. Surface the product’s “moment of instant start” idea inside the architecture overview and mention that link generation happens **inside** the existing session (basing the explanation on `capabilities/link-sharing.md`), eliminating any portrayal of a standalone invite phase.
3. Illustrate how WebRTC signaling (`arch/rtc/*`) and env deployment (`arch/env/*`) support **one URL/one session** by describing how the server holds only ephemeral technical state (matching `overview.md`’s “minimal server state” mandate).
4. Keep the TeqFW naming/DI patterns untouched but add explicit pointers that the single-window philosophy is enforced through the state machine described in `arch/state.md`.
5. Remove or collapse redundant documents (`arch/teqfw/state.md` duplicates `arch/state.md`) while recording in the plan that whichever version remains must emphasize states `ready/waiting/active` instead of discrete screens.
