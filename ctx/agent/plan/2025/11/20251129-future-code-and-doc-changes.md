# Future code and documentation changes
Path: `./ctx/agent/plan/2025/11/20251129-future-code-and-doc-changes.md`

## Code tasks
1. **Single-window state machine** — rewrite `web/app/Ui/Flow.mjs`, `web/app/Ui/Controller.mjs`, `web/app/State/Machine.mjs` and related screen renderers so that the DOM no longer swaps `home → invite → call → end` templates. Replace them with one renderer (`renderState(stateName)`) that toggles fragments corresponding to `ready`, `waiting`, `active`, `ended` and keeps `settings` as an overlay (`20251129-rules-implementation-fixes`). Keep `sessionId` tied to this machine and reuse the same `Flow`/`ShareLink` helpers as the single state evolves.
2. **Share-link overlay** — move link-sharing UI from `web/ui/screen/invite` into a contextual panel that appears when the state machine enters `waiting`; generate and display the link inline, start media immediately in `active`, and keep the link visible until hangup.
3. **State-aware fragments** — rework the old screen modules (`web/ui/screen/*.html`, `web/app/Ui/Screen/*`) into state fragments or remove them entirely so that `ready`, `waiting`, `active`, `ended` are expressed as sections of a single page; update CSS/JS so that toggling a fragment updates the DOM rather than replacing it.
4. **Session logic** — ensure `sessionId` is created once per state machine, persists for the lifetime of the single window, and is referenced by `Flow`, `ShareLink`, `Net`, `Rtc` without re-instantiating new IDs; remove any leftover code paths that attempt to treat `home`/`invite` as separate rooms.

## Documentation follow-ups
1. After the code rewrite, remove the FUTURE PLAN callouts from `ctx/rules/architecture.md`, `web/app.md`, `web/ui/screens.md`, `web/contours/core.md`, `web/ui/share-link.md`, `web/ui/screen/*.md`, `web/testing.md`, `arch/state.md`, etc., and rewrite them so the single-window, `ready/waiting/active` language describes the actual implementation (no `home/invite/call/end`). Document the new fragments/overlays that replace the previous screens.
2. Update the CI/test documentation (`web/testing.md`, `node/testing.md`, `arch/testing.md`) to describe mocks and assertions using the new state names rather than the old screen names, referencing the code modules that implement them (Flow, Controller, StateMachine).
3. Refresh the narrative in `ctx/rules/web/ui/layout.md`, `style.md`, `component/*`, `web/infra/*`, `arch/rtc/*`, etc., removing retrospective notes and treating the single-window state machine as the live contract; keep the references to product capabilities for traceability.
4. Once the code no longer uses the old screens, delete the `FUTURE PLAN` notes in the `ctx/rules` corpus, and consider removing the `backups/` archive if it is no longer needed.
