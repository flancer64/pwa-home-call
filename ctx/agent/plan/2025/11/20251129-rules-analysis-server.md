# Rules Analysis: Backend + Server Configuration

## Scope
- `node/bin/server.md`
- `node/testing.md`
- `arch/back.md`
- `arch/env/config.md`
- `arch/env/node.md`
- `arch/env/apache.md`
- `arch/env/systemd.md`
- `arch/env/logrotate.md`

## Existing narrative
The backend documentation describes a single Node.js process bootstrapped through `bin/server.js`, the TeqFW DI container, the `HomeCall_Back_App`, and the WebSocket signaling server. Environment docs cover `.env` variables, Apache proxying, systemd service files, and log rotation, all focused on keeping the backend running continuously. Tests rely on DI containers and mirror the architecture-level rules.

## Product gap
- `ctx/product/overview.md` emphasises that the server should maintain “only technical state” (session IDs, WebPush metadata, no user profiles) and remain transparent to the user, yet the backend docs do not explicitly call this out. Without that emphasis, the later refactors may mistakenly introduce richer state, queues, or second-phase invite tracking.
- The systemd/logrotate docs describe persistent log files in `/home/{user}/store/...`, but `overview.md` prefers the server stay minimal and easy to clone; we should mention that the logging/service stack must stay cross-platform and not require bespoke user accounts or manual state beyond the ephemeral WebSocket sessions.
- The `.env`/Node doc should highlight that `sessionId` is only valid while the browser window is active and that the server is stateless beyond the current pair of sockets, aligning with `capabilities/link-sharing.md`.

## Required updates
1. Annotate `arch/back.md` and `node/bin/server.md` with statements that the backend keeps no user profiles, only the ephemeral `sessionId` until `hangup`, matching `overview.md`’s privacy requirements.
2. Update `arch/env/config.md` and `arch/env/node.md` to emphasise headless, reproducible deployments (no manual per-session data) and remind readers that `sessionId` is always tied to the single window in the UI.
3. In `node/testing.md`, remind maintainers that tests must mimic the minimal state of the signal server (two sockets per `sessionId`, no database) so that the codebase doesn’t drift toward storing invitations or names.
4. Keep `systemd`/`logrotate` documentation but include a sentence that each node instance is intended to be clonable (no extra data beyond logs), reiterating the product’s autonomy claim.
