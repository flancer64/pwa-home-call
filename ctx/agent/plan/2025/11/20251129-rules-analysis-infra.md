# Rules Analysis: Supporting Policy & Tests

## Scope
- `codex.md`
- `language.md`
- `privacy.md`
- `web/testing.md`
- `node/testing.md`

## Existing narrative
These policy documents describe the language/format constraints, Codex expectations, and testing invariants (DI-only imports, helper-based containers). `privacy.md` already stresses the absence of personal data; `codex.md` describes how cognitive agents influence generated code; the testing documents reiterate the architecture-level alignment.

## Product gap
- None of these policies currently mention the **single-window, link-in-session** narrative from `ctx/product/overview.md` and `capabilities/*`. Without explicit references, downstream contributors may misunderstand why we avoid the invite screen or why the link is ephemeral, despite the privacy goal.
- `privacy.md` should explicitly cite the new model (link stays within one session, identity data is never stored), reinforcing the product’s statement about no personal data. Similarly, `codex.md` could remind agents to avoid generating UI that builds separate invite screens.
- The testing docs can reinforce the new flow by mentioning that tests should emulate state transitions (`ready → waiting → active`) rather than separate screens, preserving the link-generation logic inside the same window.

## Required updates
1. Expand `privacy.md` to cite the updated product model and clarify that link-sharing happens inside the active session, ensuring no personal identifiers ever leave that window.
2. Note in `codex.md` that agents must not scaffold separate screens—any UI change should preserve the single-window/one-session philosophy described in `overview.md`.
3. Adjust `web/testing.md` and `node/testing.md` to mention that mocks/drivers should reproduce the `ready/waiting/active` transitions rather than cycling through `home/invite/call/end`, so tests mirror the product lifecycle.
