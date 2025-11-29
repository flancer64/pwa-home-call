# Documentation fix list (non-code)

1. **Reframe the `home → invite → call → end` narrative**  
   *Affected files:* `web/app.md`, `web/ui/screens.md`, `web/ui/screen/*.md`, `web/contours/core.md`, `arch/front.md`, `arch/architecture.md`  
   *Action:* Replace mentions of discrete screens with a single-window state machine (`ready`, `waiting`, `active`, `ended`), describe how each UI fragment toggles in place, and cite `ctx/product/flows/connection.md` as the source of this lifecycle.

2. **Describe link-sharing as part of the active session**  
   *Affected files:* `web/ui/share-link.md`, `web/ui/screen/invite.md`, `web/infra/ws.md`, `web/ui/component` docs  
   *Action:* Document that the share link is generated inside the in-progress session, remains valid only while the session lasts, and is surfaced via an overlay/panel rather than a full invite screen; remove any mention of separate `invite → call` CTA sequences.

3. **Align state/state-machine docs to product terminology**  
   *Affected files:* `arch/state.md`, `web/contours/core.md`, `web/contours/ui.md`  
   *Action:* Introduce explicit mapping tables showing how DI callbacks (`onCallRequest`, `onStartCall`, etc.) transition between `ready/waiting/active` (plus `settings/ended`) and reference `capabilities/connection.md` for the naming. Mention that toasts remain the only place for dynamic statuses.

4. **Adjust architecture/deployment docs for minimal server state**  
   *Affected files:* `arch/back.md`, `arch/env/*.md`, `node/bin/server.md`, `privacy.md`, `web/infra/storage.md`  
   *Action:* Emphasize that the backend stores only ephemeral session metadata, that `.env` variables address ports and host names only, and that no invites or user profiles are persisted. Link this statement back to `overview.md`’s privacy promise.

5. **Update component/layout/style documents**  
   *Affected files:* `web/ui/layout.md`, `web/ui/style.md`, `web/ui/component/*.md`, `web/ui/notifications.md`  
   *Action:* Describe components as reusable fragments that the state machine shows/hides, not entire screens. Mention that the `screen-card` zones exist inside the single window and that toast notifications remain the sole channel for asynchronous statuses.

6. **Clarify testing and policy doc expectations**  
   *Affected files:* `web/testing.md`, `node/testing.md`, `codex.md`, `language.md`  
   *Action:* Add guidance that tests and Codex-generated modules must respect the new single-window lifecycle and should not scaffold separate invite screens; remind readers that logging/notifications should stay consistent with the `ready/waiting/active` cues.

7. **Link the documentation to the actual code entry points**  
   *Affected files:* `web/app.md`, `web/ui/share-link.md`, `arch/architecture.md`, `arch/back.md`  
   *Action:* Whenever a state or transition is described, mention the relevant files (e.g., `web/app/Ui/Flow.mjs`, `web/app/Ui/Controller.mjs`, `web/app/State/Machine.mjs`, `web/app/Ui/InviteService.mjs`) so future readers can trace the plan to the implementation.
