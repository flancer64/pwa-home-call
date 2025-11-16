# Report: Doc consistency sweep

## Goal
- verify that the documents under `ctx/rules` stay aligned and surface any conflicting statements.

## Actions
- inspected `ctx/rules/arch/*` and `ctx/rules/web/*` to understand the claimed architecture, frontend interaction model, and signaling protocol.
- Compared overlapping statements about inter-contour communication and signal/message formats across the architectural and contour-specific documents.

## Findings
- The frontend is described as wired through `Shared.EventBus` in `ctx/rules/arch/front.md`, but contour specifics (`ctx/rules/web/contours/core.md` and `media.md` & `rtc.md`) state the system relies solely on DI callbacks and explicitly avoids any event bus.
- `ctx/rules/arch/rtc/signaling.md` forbids `from/to` fields and mandates `join`/`leave` messages, yet `ctx/rules/web/infra/ws.md` includes a `from` field in every signal and claims clients never emit `join`/`leave`.
*** End Patch
