# Call screen minimal layout
**Goal:** bring `call` view into exact alignment with `ctx/rules/web/ui/screens/call.md`, keeping only the remote stream plus settings/close controls while reusing the existing media stack and navigation hooks.

**Actions:**
- replaced `web/ui/call.html` with a single-stage template where the remote video fills the viewport, the local preview floats in the bottom-right corner, the FAB settings button reuses the home styling, and the only action button is the centered **«Закрыть»** control.
- overhauled `web/assets/style.css` call-specific rules so the card drops its padding/background, the video stage stretches edge-to-edge, floating elements stay within the viewport, and the dark-gradient theme plus large controls match the rest of the app.
- simplified `web/app/Ui/Screen/Call.mjs` to bind just the remote/local video plus the new control hooks, removing all overlays/status indicators while still honoring `media.prepare()` bindings.
- updated `web/app/Ui/Flow.mjs` so opening settings from call now returns to the call screen and the home flow still targets home, keeping navigation consistent with the FAB paths described in the documentation.
- stabilized the `.call-close` FAB so it respects safe-area insets and disables the default hover translation, keeping the close button anchored above the browser chrome on mobile and preventing the desktop hover jump.
- ensured the remote video is non-interactive so the overlaid settings FAB can always receive pointer events, restoring the expected tap/hover behavior for opening settings.
- raised the local preview and button insets so the floating thumbnail no longer overlaps “Закрыть” and the CTA sits fully inside mobile browser chrome while staying centered on large screens.
- increased the bottom padding for the local preview so it sits at least two button-heights above the viewport edge and ensured the “Закрыть” FAB maintains visibility when the browser address bar is present.
- ensured the float offset now references the actual close button height (`--call-close-height`) so the local preview stays exactly two FAB heights above the bottom regardless of viewport size or safe-area inset.

**Results:**
- the active call screen now matches the minimal, full-viewport layout defined in the rules document, showing only the remote stream, local preview, settings FAB, and single close button.
- media bindings continue to handle stream lifecycle without exposing any status overlays, and settings navigation behaves correctly from both home and call contexts.

**Testing:** `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` still aborts with the historical `test failed` error).* 
