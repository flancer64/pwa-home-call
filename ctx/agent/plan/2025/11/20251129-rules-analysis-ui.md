# Rules Analysis: UI Layer (PWA, layout, components)

## Scope
- `web/AGENTS.md`
- `web/app.md`
- `web/structure.md`
- `web/logging.md`
- `web/testing.md`
- `web/ui/layout.md`
- `web/ui/style.md`
- `web/ui/notifications.md`
- `web/ui/share-link.md`
- `web/ui/page/index.md`, `web/ui/page/reinstall.md`
- `web/ui/component/*.md`

## Existing story
The UI docs still describe the browser app as a cascade of **discrete screens** (`home → invite → call → end`) built with three-zone cards and specialized components (`big-button`, `screen-card`, `screen-header`, etc.). `web/app.md` narrates how Core “creates a sessionId”, shows `invite` with a link, and only then starts WebRTC; `web/ui/share-link.md` rehearses the same “generate share link before the call” sequence. The component documents describe static cards for each screen, with little reference to the single-window behaviour advocated by the product level.

## Product misalignment
- `ctx/product/overview.md` stresses a “single window” experience: the initiator stays in one view, the link is shared from there, and there is no separate invitation UI. The UI documentation still depicts an invite stage with its own CTA, CTA transitions, and a card populated with a link — this contradicts the latest product story.
- `ctx/product/capabilities/link-sharing.md` says the link is created **from within the active media session** and remains tied to it. The UI docs instead generate the link before any media has started, in a distinct `invite` screen that interrupts the path and requires two separate CTAs (`Связать` on `home`, another `Связать` on `invite`).
- `ctx/product/capabilities/connection.md` defines the states `ready`, `waiting`, `active`, whereas the UI docs treat state as an enumeration of screens and rely on `component`+`screen` combos. This encourages the code to instantiate different DOM chunks rather than toggle stateful fragments or overlays within one window.

## Required UI rewrite
1. Rephrase `web/app.md` and `web/ui/screens.md` so that they describe an **adaptive single view** with three states (`ready`, `waiting`, `active`) rather than sequential screens. Mention that `invite` content should become a contextual overlay inside the same view when link sharing is triggered.
2. Update `web/ui/share-link.md` and component docs to clarify that the sharing action happens as soon as the session is ready — use the “link is tied to the current session and visible to the initiator via a contextual panel” language from `capabilities/link-sharing.md`.
3. Streamline `web/ui/layout.md`, `style.md`, and the component guides to reflect that cards/sections are **stateful fragments** of a single screen: e.g., `screen-card` just depicts zones that show or hide depending on the state, not entire pages.
4. Emphasize in `web/ui/notifications.md` that toasts are the sole vehicle for status updates, so nothing in the UI layer should spawn additional overlays or separate screens.
5. Ensure `web/structure.md` and `web/logging.md` mention that the frontend remains a single SPA with dynamic sections, keeping remote logging toggle logic compliant with the privacy/rules statements (no extra personal data stored).
