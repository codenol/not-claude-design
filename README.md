# Skala DS & Norka

Design System (React ↔ Figma) + Norka — collaborative PRD builder and design workspace.

**Stack:** React 19 + TypeScript + Vite / pnpm workspace / Figma MCP / CSS Modules + SCSS tokens / Agentation

## Structure

| Layer | Path |
|-------|------|
| Tokens | `artifacts/tokens.json` → `app/src/tokens/` |
| Components | `app/src/components/{atoms,molecules,organisms}/` |
| Renderer | `app/src/renderer/` — YAML → React blocks |
| Pages | `app/src/pages/` — Login, Entry, Projects, Libraries, FeatureWorkspace |
| Features | `app/src/features/` — workflow state machine, types, routes, demo data |
| PRD Builder | `app/src/prd-builder/` — Persona, UseCase, DataModel, Screen, Variant editors |
| Stages | `app/src/stages/` — Analytics, Discussion, Prototypes, Finalize |
| Services | `app/src/services/` — storage (IndexedDB), LLM, git, routing, role config |
| Contracts | `contracts/` — screen DSL + PRD JSON Schema |
| Figma | `figma.config.json` |
| Packages | `packages/` — pnpm workspace (agentation) |

## Quick start

```bash
cd app && npm install && npm run dev
```

## Norka

A tool for product teams to collaboratively build PRDs. Features progress through staged workflows (analytics → prototypes → discussion → finalize), with structured editors, role-based permissions, and LLM/AI integration via agentation.

## YAML Playground

Declare screens in YAML and render them live. See `contracts/screen-contract.md`.
