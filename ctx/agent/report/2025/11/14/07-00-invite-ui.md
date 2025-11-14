# Invite UI flow

## Summary
- Rebuilt the `home`/`invite`/`call`/`end` stack with the new large UI rhythm (`ui-large`, three-zone layout, large typography) plus the invite screen that surfaces the shareable link, copy/share buttons, and the **Start call** CTA (`web/ui/enter.html`, `web/ui/invite.html`, `web/ui/call.html`, `web/ui/end.html`, `web/assets/style.css`).
- Extended `HomeCall_Web_Core_App` to preserve the saved name banner, reset actions, incoming-room hint, the invite screen wiring, and explicit copy/share helpers; added media-status badges in the call screen controller, while updating `web/app/Core/UiController.mjs`, `web/app/Core/App.mjs`, `web/app/Ui/Screen/Enter.mjs`, `web/app/Ui/Screen/Invite.mjs`, and `web/app/Ui/Screen/Call.mjs`.
- Documented the refreshed behavior in the cognitive layer (`ctx/product/scenarios/*`, `ctx/product/features/invite.md`, and the relevant `ctx/rules/web/**` files) and bumped `web/version.json` to `20251114-071327` for the mandatory web version bump.

## Testing
- `npm run test:unit` *(fails: `test/unit/Back/Service/Signal/Server.test.mjs` still aborts with the historical `test failed` message; no new back-end changes were made in this iteration.)*
