# **Icon Assets Subsystem**

**Path:** `web/assets/icons/AGENTS.md`

## **Purpose**

This directory contains all SVG icons used by the client-side UI.
It defines a unified source of truth for icon files, ensures consistency across components, and prevents uncontrolled variations such as inline SVGs or custom per-component assets.

The subsystem guarantees that every icon in the application comes from the same library, follows the same visual rules, and is delivered as static files.

---

## **Source of Icons**

- Icons **must** originate from the package `lucide-static`.
- The agent must copy required files from:

```text
node_modules/lucide-static/icons/*.svg
```

into:

```text
web/assets/icons/
```

- Filenames must remain unchanged.
- SVG contents must not be modified.

This rule ensures stability of icon geometry, stroke quality, and naming.

---

## **Delivery and Access**

Icons stored in this directory are exposed to the application as static files:

```
/assets/icons/<name>.svg
```

UI components reference them directly or through `icon-wrapper`, which applies theme-based color and size rules.

No icon is to be embedded inline in component templates.

---

## **Invariants**

1. **SVG-only:**
   All icons in this directory must be plain SVG files taken from `lucide-static`.

2. **Single source:**
   Icons from other libraries or manually authored SVGs are not permitted.

3. **No inline SVG:**
   Components must not embed SVG markup directly in their templates.
   Fallback icons must also reference files from this directory.

4. **No transformation:**
   Agents must not alter stroke width, paths, attributes, or viewBox values inside SVGs.

5. **Theme-controlled appearance:**
   Coloring and styling of icons are handled through CSS variables defined in the UI theme; SVG files remain unmodified.

---

## **Agent Responsibilities**

- Copy only the icons actually used by the application.
- Ensure the directory remains clean and free of unused files.
- When a new UI component requires an icon, copy it from `lucide-static` instead of generating or embedding it.
- Do not optimize, inline, or alter SVGs during copying.

---

## **Relations**

- `ctx/composition/client/ui/components/icon-wrapper.md` — defines how components render SVG icons from this directory.
- `ctx/composition/client/ui/patterns/style.md` — defines color, stroke, and visual rules applied to icons.
- UI components (`big-button`, `header-action-button`, overlays, FAB) rely on these icons for consistent geometry and theme integration.

---
