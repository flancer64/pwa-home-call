# Web version bump & instructions link

- **Goal:** explain why `web/version.json` needed update and document that `web/AGENTS.md` must be consulted when working inside `web/`.
- **Actions:** set `web/version.json` to the fresh UTC timestamp `20251111-093941`, linked the root `AGENTS.md` to `web/AGENTS.md`, and added the explicit requirement to obey web-space instructions when editing web assets.
- **Results:** web layer now carries a new version marker, and agents know to read/obey `web/AGENTS.md` whenever touching `web/` subpaths.
- **Testing:** no automated tests were run (doc-only change).
