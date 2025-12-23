---
name: pikacss-dev
description: Develop, test, and document the PikaCSS monorepo (core engine, unplugin adapters, Vite/Nuxt plugins, docs site) using pnpm-based workflows.
license: MIT
compatibility: Requires pnpm 10.24.0 and a recent Node.js LTS in a workspace checkout.
metadata:
  repo: pikacss
  version: 0.0.34
allowed-tools: bash:pnpm bash:node read
---

## Purpose
Use this skill to work on PikaCSS internals (not for end-users). It covers builds, tests, docs, plugin adapters, and release hygiene across the monorepo.

## Setup
- Install dependencies: pnpm install
- Hooks: simple-git-hooks + lint-staged run automatically on prepare
- Preferred environment: Node LTS (18+), pnpm 10.24.0

## Core workflows
- Builds, tests, typecheck, lint, docs, and release guidance are in [reference-commands.md](reference-commands.md).
- Package map, plugin targets, docs, and examples are in [reference-packages.md](reference-packages.md).
- Scaffolding: Use `pnpm newpkg` for general packages or `pnpm newplugin` for PikaCSS plugins.

## Notes and cautions
- Release pipeline (`pnpm release`) chains build, docs, typecheck, publint, dist cleanup, and version bump; use only when intending to publish.
- Publint validates published exports; run before publish changes to packages.
- Use filters when touching a single package to keep tasks fast.
- Keep docs and examples consistent with core changes; see references for locations.
