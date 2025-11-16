# Report: Align docs to DI-only and simplified signaling

## Goal
- reflect the decision to stop using `Shared.EventBus` and to keep signaling messages minimal.

## Actions
- rewrote `ctx/rules/arch/front.md` and `ctx/rules/architecture.md` so the frontend wiring describes DI callbacks, shared services, and no global EventBus.
- replaced `ctx/rules/arch/rtc/signaling.md` with the simplified protocol that carries only `sessionId` plus `offer`/`answer`/`candidate`/`error` payloads and omits `join`/`leave` or `from/to`.
- updated `ctx/rules/web/infra/ws.md` to describe the pared-down message shape, emphasize session-only routing, and drop the obsolete `from`/`join`/`leave` references.

## Results
- All architectural and contour-centric docs agree that contours communicate through DI callbacks and shared services.
- The signaling reference is now a single source of truth for the minimalist SDP/ICE exchange used by both client and server.
