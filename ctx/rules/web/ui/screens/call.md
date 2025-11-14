# Call Screen

**Path:** ./ctx/rules/web/ui/screens/call.md

## Purpose
The `call` screen shows the live video from the other participant and provides clear feedback about the local camera and microphone. It keeps the entire viewport for the remote stream while layering the new status overlay on top.

## Layout
- The screen still consists of the three zones, but the action zone is now primarily the `call-stage` area.
- `call-stage` contains the remote `<video>` plus an overlay with two `media-indicator` cards (camera and microphone), a central status message, and the **«Повторить»** button that becomes visible when hardware access is blocked.
- The bottom action area holds the wide **«Завершить звонок»** button and the floating local-miniature preview.

## Behavior
1. When the call starts, `call-stage` renders the remote stream; the media overlay immediately reports the latest state provided by `HomeCall_Web_Media_Manager` (using `HomeCall_Web_State_Media` to know if the camera/mic are ready, paused, blocked, etc.).
2. Each indicator displays an icon, the device name, and the current state text (`Готово`, `Приостановлено`, `Заблокировано`, `Не поддерживается`, `Ожидание`). Colors change via `data-state` so the user can read the health of each device at a glance.
3. If the manager reports a blocked camera permission, the overlay reveals the **«Повторить»** button (which calls `media.prepare()` again to prompt the browser permission dialog). The status text updates with the latest message returned by `MediaManager` (all Russian), so the overlay and toasts stay in sync.
4. The single **«Завершить звонок»** button terminates the call and transitions to the `end` screen. Any network errors still show toast messages (например, «Связь потеряна» или «Не удалось установить соединение»).

## Accessibility
- The remote stream fills the card, but the overlay uses high contrast backgrounds (semi-transparent black) so the indicators and text remain legible.
- The overlay never blocks the CTA: the `call-controls` container stays at the bottom with left-right centering, guaranteeing at least one large button per screen.
