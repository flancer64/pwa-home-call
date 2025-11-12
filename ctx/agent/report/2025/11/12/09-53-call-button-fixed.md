# Iteration Report — Call Button Alignment

## Goal
- Keep the end-call FAB anchored at the lower-left corner of the active call screen instead of floating near the center.

## Actions
- Switched `.call-controls` to `position: fixed` with bottom-left insets so it always nails the viewport corner rather than the centered content area.

## Results
- The call UI now presents the end-call button in the requested bottom-left location regardless of how the video stage is centered.
