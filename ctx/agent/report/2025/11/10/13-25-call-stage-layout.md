# Call stage video layout polish

## Goal
- Make the call stage play out like a background scene: remote video fills the panel while the local stream floats as a proportional mini-preview and the stage remains responsive.

## Actions
- Reworked `.call-stage` styling so it keeps its height, hides overflow, and centers help content while remote video is positioned behind everything as an inset background.
- Kept the general video styling for covering media but introduced explicit rules for `#remote-video` and  the overlay window, including aspect ratio locking, subtle framing, and stacking order so fallback text/buttons stay readable.

## Results
- Remote stream now stretches across the entire call stage while preserving proportions.
- Local stream remains a cleanly bordered, bottom-right overlay with controlled size and ratio.
- Layout retains its responsiveness and keeps overlay controls accessible because of the maintained flex arrangement and overflow handling.

## Testing
- Not run (styling change only).
