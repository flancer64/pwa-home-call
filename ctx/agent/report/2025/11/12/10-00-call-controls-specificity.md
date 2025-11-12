# Iteration Report — Call Controls Specificity

## Goal
- Make `.call-controls` truly respect its standalone positioning so the end-call FAB can anchor to the bottom-left without being forced to `position: relative`.

## Actions
- Allowed the general `.call-stage` rule to skip `.call-controls` by adding `:not(.call-controls)` to the selector, preventing the more specific selector with IDs from overriding the FAB container.

## Results
- The end-call container no longer receives `position: relative`, so its `position: fixed` and inset offsets from `web/assets/style.css` now take effect as intended.
