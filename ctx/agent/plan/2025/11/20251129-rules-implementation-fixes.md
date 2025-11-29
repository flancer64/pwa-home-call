# Implementation fix list (code)

1. **Collapse `home → invite → call → end` into one view**  
   *Files:* `web/app/Ui/Flow.mjs`, `web/app/Ui/Controller.mjs`, `web/ui/screen/*.html`  
   *Issue:* The flow/controller still instantiate four separate screen renderers (`showHome`, `showInvite`, `showCall`, `showEnd`) and render distinct HTML pages. This enforces multi-screen navigation.  
   *Fix:* Replace these methods with a single `renderState(state)` that toggles the DOM fragments corresponding to `ready`, `waiting`, `active`, and `ended`; transform the HTML templates into state sections or overlays rather than whole pages; keep `settings` as an overlay.

2. **Rename the state machine to match the product lifecycle**  
   *File:* `web/app/State/Machine.mjs`  
   *Issue:* The machine uses state names `home`, `invite`, `call`, `end` and toggles CSS classes based on those screen names.  
   *Fix:* Update the machine to `ready`, `waiting`, `active`, `ended` (and possibly `settings` as an overlay state) so DOM classes and flows describe the single-window lifecycle; reuse these names when wiring to `Ui.Flow`.

3. **Treat share-link behavior as part of the active session, not a new screen**  
   *Files:* `web/app/Ui/Flow.mjs` (methods `prepareOutgoingInvite`, `handleStartCall`), `web/app/Ui/Screen/Invite.mjs`, `web/ui/AGENTS`  
   *Issue:* The flow generates a session ID, shows `invite`, then waits for the second button to start the call; the invite screen has its own template.  
   *Fix:* Generate the share link once the state enters `waiting`, display it inline (overlay/panel), and start WebRTC directly from the same state machine; the `Invite` renderer should morph into a share panel rather than a standalone screen.

4. **Update UI fragments to support dynamic state toggling**  
   *Files:* `web/app/Ui/Screen/*.mjs`, `web/ui/screen/*.html`  
   *Issue:* Each screen module assumes its DOM will replace the root (`Home`, `Invite`, `Call`, `End`).  
   *Fix:* Rework these modules into state-aware fragments or remove the screen classes altogether, moving the markup into a single template with conditional fragments that the state machine enables/ disables.

5. **Keep the signal/session logic tied to the current session object**  
   *Files:* `web/app/Ui/Flow.mjs`, `web/app/Ui/InviteService.mjs`, `web/app/State/Machine.mjs`  
   *Issue:* `prepareOutgoingInvite` clears `pendingSession`, creates a new `sessionId`, and still treats `sessionId` as a cross-screen token.  
   *Fix:* Keep the `sessionId` bound to the current state machine (`waiting`/`active`) and ensure all actions (start call, send link, copy link) reference that single session.
