# End Screen

**Path:** ./ctx/rules/web/ui/screens/end.md

## Purpose
`end` delivers one unmistakable message: the call finished, and the user can return to the main screen to dial again.

## Layout
- Follows the three-zone pattern: a header with «Звонок завершён», an action zone with the **«Вернуться на главную»** button sized with the `ui-large` utility, and a hint explaining (on Russian text) that tapping again will start a fresh session.
- There are no secondary controls or status icons; post-call diagnostics appear as `toast` messages before the screen appears.

## Behavior
1. `HomeCall_Web_Core_App.endCall` stops all local streams, terminates the peer connection, stores the final message (`state.connectionMessage`), and renders `end`.
2. The `onReturn` callback clears the active `sessionId`, resets the view to `home`, and leaves the experience ready for a new tap without persisting any personal data.
