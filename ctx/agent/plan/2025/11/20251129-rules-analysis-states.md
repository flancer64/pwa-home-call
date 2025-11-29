# Rules Analysis: State/Flow Documentation

## Scope
- `web/ui/screens.md`
- All files under `web/ui/screen/` (`home.md`, `invite.md`, `call.md`, `end.md`, `settings.md`)
- `arch/state.md`
- `web/contours/core.md`
- Reference documents: `ctx/product/flows/connection.md`, `ctx/product/capabilities/connection.md`

## Existing narrative
The state-focused docs still catalogue discrete screens (home, invite, call, end) with their own components and CTAs; `screens.md` is the canonical map of transitions, and `web/contours/core.md` mirrors that by having Core orchestrate `showHome()`, `showInvite()`, etc. `arch/state.md` explains generic state machines but does not explicitly align those transitions to the `ready/waiting/active` pattern introduced in the product layer.

## Product gap
- `ctx/product/flows/connection.md` says there is **only one browser tab/window**, and the initiator and responder traverse the flow together, never leaving that window. The current docs keep “invite” separate and describe multiple CTA buttons, which contradicts the “single space” principle.
- `capabilities/connection.md` defines the lifecycle as `ready` (preparing media), `waiting` (invite link ready, awaiting peer), and `active` (media streaming). The `screens.md`/`core.md` content still refers to `home/invite/call`, encouraging the code to instantiate different screens rather than toggling the state of a single UI.
- The entire `invite` screen (and `share-link` logic) implies a two-step process, while the product says the link is generated automatically inside the current session and becomes visible in the same view.

## Required rewriting
1. Reframe `web/ui/screens.md` (and the component-specific screens) so that each “screen” is instead described as **a variant or sub-section of the same view**, triggered when the state machine transitions to `ready`, `waiting`, or `active`. The narrative should emphasise that these variants reuse the same DOM container rather than spawning new ones.
2. Update `arch/state.md` to illustrate the actual states referenced in `capabilities/connection.md`, showing how events map to state names and how `Core` toggles visibility instead of routing.
3. In `web/contours/core.md`, state transitions should be expressed as calls to a single UI updater (`showState(ready/waiting/active)`) rather than alternating between `showHome`, `showInvite`, etc.; mention how the `share-link` overlay is part of the `waiting` state.
4. Remove or rework the `invite` screen doc so that it describes the sharing overlay or modal within the `waiting` state. The `call` and `end` docs should similarly explain stateful variations (e.g., spinner while waiting, remote stream once active) rather than separate pages.
