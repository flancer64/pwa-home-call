# UI rules consolidation
**Goal:** align the UI documentation and implementation with the ADSM mandate for a lean, single-CTA interface so that call states stay clean, statuses go through toasts, and transitions are centralized.

**Actions:**
- rewrote `ctx/rules/web/ui/layout.md`, `style.md`, `notifications.md`, `share-link.md`, `screens/` files, and the AGENTS maps so the layout, palette, toast policy, share mechanics, and per-screen descriptions all reference a single three-zone skeleton, a dark gradient palette, and a single source of truth for transitions (`screens.md`);
- created `ctx/rules/web/ui/screens.md` to hold the `home → invite → call → end` map/CTA list, trimmed each screen doc to its unique zones, and documented the toasts-only status routing in `notifications.md`;
- simplified `web/app/Ui/Screen/Call.mjs`, aligned `web/assets/style.css` with the new gradients and removed unused overlay variables, and bumped `web/version.json` to `20251126-055022` so PWA updates follow the code changes.

**Results:**
- The UI rules now explicitly forbid overlays, hint noise, and extra controls while directing media/permission errors through toast notifications and share/copy flows (`share-link.md`).
- The call screen implementation only binds the remote/local video plus settings/close hooks, and the global CSS variables reflect the unified gradient/green palette; the version bump records the updated web surface.

**Testing:** Not run (not requested).
