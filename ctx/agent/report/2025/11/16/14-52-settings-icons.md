# Settings icons and gradient

## Goal
- Make both settings buttons match the home CTA style and use lucide icons pulled into `web/assets/icons`.

## Actions
- Copied `refresh-ccw.svg` and `rss.svg` from `node_modules/lucide-static/icons` into `web/assets/icons` and replaced the inline SVG glyphs with `<img>` references so the UI reuses those assets.
- Updated `web/ui/settings.html` and the template CSS so both buttons carry the `primary` gradient, rely on the shared `ui-large` styles, and still expose `aria-pressed` for the remote logging toggle.
- Re-synchronized `web/version.json` to `20251116-145211` after the new UI assets.

## Results
- Settings buttons now look identical to the home action, use Lucide glyphs, and preserve the toggle semantics without extra colors.
- Remote logging configuration still works through the shared module; the reinstall button simply reuses the same gradient CTA style.
- `npm run test:unit` keeps failing in `test/unit/Back/Service/Signal/Server.test.mjs` because the WebSocket server in `src/Back/Service/Signal/Server.js` cannot bind to a port (`listen EPERM: operation not permitted`).
