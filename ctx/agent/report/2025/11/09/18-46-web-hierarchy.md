# Web docs hierarchy alignment

## Goal
Document the browser app rules in `ctx/rules/web/` so that `app.md` is the authoritative overview and contour-level documents follow a consistent, declarative structure.

## Actions
- Updated `AGENTS.md` and `structure.md` to reference `app.md` as the system model, clarified the role of contours, and streamlined the file-structure principles.
- Added contour intros, consistent boundaries, cross-linking to `app.md`, and uniform `## Итог` summaries to `core.md`, `ui.md`, `media.md`, `net.md`, `rtc.md`, `env.md`, `shared.md`, `ui/screens.md`, `pwa.md`, and `style.md`.
- Ensured the `ui screens` navigation matches the `enter → lobby → call → end` sequence and that `pwa.md` explicitly refers to the relevant section of `app.md`.

## Results
- All web-level documents now declare their relation to `app.md`, share the same formal layout, and end with the required cross-reference phrase.
- Contour documents describe their boundaries and connections declaratively, mirroring the hierarchy from `app.md` down to specialized topics.

## Next steps
- Review other `ctx/rules/web/` files (e.g., `ws.md`) if they should also link back to `app.md` and follow the updated section structure.
