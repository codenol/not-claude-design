# Skala DS — Agent Guide

## Project

Parity environment: React Design System ↔ Figma Design System. Every React component = Figma component = token. Mismatch = bug, fix both sides.

## Commands

- **Start React dev server**: `cd app && npm run dev` (not yet scaffolded — run `npm create vite@latest app -- --template react-ts` first)
- **Install HTML parser**: `cd app && npm i -D cheerio`
- **Run extraction script**: `node app/scripts/extract-patterns.mjs`

## Architecture (3 layers)

1. **Directives** (`directives/`) — markdown instructions per pipeline step
2. **Orchestration** (`CLAUDE.md`) — agent reads directive, calls MCP/scripts
3. **Execution** — token generators, Figma MCP calls, parsers

## Workflow Order

1. `quickstart` → briefing + skeleton (done)
2. `figma_mcp_setup` → authenticate + smoke test
3. Branch: Figma / Git / Local / HTML / Scratch
4. `build_tokens` → `artifacts/tokens.json` + `app/src/tokens/*`
5. `build_react_ds` → components in `app/src/components/{atoms,molecules,organisms}/`
6. `sync_to_figma` → mirror to Figma via MCP batches
7. `parity_check` → audit after every significant iteration

## Critical Rules

- **No hardcoded** colors/sizes/fonts outside `tokens.ts`. Only CSS variables.
- **Names 1:1** — React component name = Figma component name. Variant property = React prop.
- **Never** call `node.resize(W, 0)` on auto-layout. Use `primaryAxisSizingMode = "AUTO"`.
- **Always** bind TEXT nodes to Text Styles via `setTextStyleIdAsync`, never raw fontName + fontSize.
- **SVG icons** — use `figma.createNodeFromSvg(svg)`, not vectorPaths.
- **use_figma** — ~15KB per call, split large operations into batches.
- **After every completed task** — open browser via Playwright MCP and show the result to the user.

## Verification Rules

- **Always verify via Playwright computed styles**, never by screenshots.
- **Compare from general to specific**: Layout → Organism → Molecule → Atom.
- **Check tokens**: colors, spacing, border-radius, fonts — all must match Figma `get_variable_defs`.
- **Autolayout interpretation**: W Fill / H Fill = flex with `flex: 1 0 0`, not fixed sizes.
- **Sidebar height**: Fill (stretches to parent), not fixed 812px.

## Figma MCP

- Config: `opencode.json` (remote MCP with Bearer token)
- File key: `yvQfgfkTb8FRN8EaVCUNru`
- Public params: `figma.config.json`
- Token stored in `opencode.json` headers — **do not commit to git**

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Layer 2 orchestration instructions |
| `opencode.json` | MCP config (Figma token) |
| `figma.config.json` | Figma file key, pages, collections |
| `directives/quickstart.md` | Entry point pipeline |
| `artifacts/tokens.json` | Canonical token source |
| `artifacts/figma-mirror.json` | Figma node IDs (gitignored) |

## Current State

Skeleton deployed. React app not yet scaffolded. Figma MCP configured with token, needs smoke test.
