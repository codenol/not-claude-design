# Skala DS

Design System parity environment: React ↔ Figma. Every component in code mirrors a Figma component.

**Stack:** React 19 + TypeScript + Vite / Figma MCP / CSS Modules + SCSS tokens

## Structure

| Layer | Path |
|-------|------|
| Directives | `directives/` |
| Tokens | `artifacts/tokens.json` → `app/src/tokens/` |
| Components | `app/src/components/{atoms,molecules,organisms}/` |
| Pages | `app/src/pages/` |
| Renderer | `app/src/renderer/` — YAML → React blocks |
| Contracts | `contracts/` — YAML DSL schema |
| Figma config | `figma.config.json` |

## Quick start

```bash
cd app && npm install && npm run dev
```

## YAML Playground

Declare screens in YAML and render them live. The renderer maps YAML block types to Skala DS components:

```yaml
meta:
  title: "My Screen"
  breadcrumbs:
    - label: "Home"
    - label: "Dashboard"
content:
  - type: section
    heading: "Actions"
    direction: row
    gap: 8
    items:
      - type: button
        label: "Save"
        sentiment: "accent"
        filled: true
        size: "large"
```

See `contracts/screen-contract.md` for the full DSL reference.
