# Rules plan index (2025-11-29)

## Foundational maps
- [Inventory of `ctx/rules/`](ctx/agent/plan/2025/11/20251129-rules-inventory.md) — structure and purpose of every document.
- [Corpus split plan](ctx/agent/plan/2025/11/20251129-rules-split-plan.md) — semantic batches aligned to Codex-Mini’s context window.

## Group analyses
1. [Architecture foundation](ctx/agent/plan/2025/11/20251129-rules-analysis-architecture.md)
2. [UI layer](ctx/agent/plan/2025/11/20251129-rules-analysis-ui.md)
3. [WebRTC + infra contours](ctx/agent/plan/2025/11/20251129-rules-analysis-webrtc.md)
4. [Backend/server configuration](ctx/agent/plan/2025/11/20251129-rules-analysis-server.md)
5. [States & flow documents](ctx/agent/plan/2025/11/20251129-rules-analysis-states.md)
6. [Supporting policy/tests](ctx/agent/plan/2025/11/20251129-rules-analysis-infra.md)

## Master refactor guidance
- [Master refactor plan](ctx/agent/plan/2025/11/20251129-rules-refactor-master-plan.md) — overall decisions for removing/replacing/adding content.
- [Implementation fixes](ctx/agent/plan/2025/11/20251129-rules-implementation-fixes.md) — code-level adjustments to match the new model.
- [Documentation fixes](ctx/agent/plan/2025/11/20251129-rules-doc-fixes.md) — targeted doc rewrites following the new single-window/instant-link narrative.

## Next steps and iteration order
1. Use the analysis files to guide rewrites in each group (start with architecture/UI because they set the tone).  
2. Apply the master plan directives to harmonize terminology (`ready`/`waiting`/`active`), link-sharing timing, and minimal server state.  
3. Update the implementation once the docs are realigned, following the implementation fix list before touching the UI templates.  
4. Keep the index updated if new plan files or refinements are added in future iterations.
