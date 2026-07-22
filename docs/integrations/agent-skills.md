---
title: Agent Skills
description: AI-assisted development skill for using and extending PikaCSS.
relatedPackages:
  - '@pikacss/core'
  - '@pikacss/unplugin-pikacss'
  - '@pikacss/plugin-icons'
  - '@pikacss/plugin-design-tokens'
relatedSources:
  - 'skills/pikacss-use/SKILL.md'
category: integrations
order: 30
---

# Agent Skills

PikaCSS ships with an agent skill that provides AI-assisted guidance for both consuming and extending PikaCSS. You can install it with the [`skills` CLI](https://www.npmjs.com/package/skills) to use it in any supported coding agent.

## Install

```bash
npx skills add pikacss/pikacss --skill pikacss-use
```

## pikacss-use

### When to Use

Use this skill when you are working with PikaCSS in any capacity:

- Setting up PikaCSS in a new project
- Configuring engine options or build integrations
- Using `pika()` and its variants
- Consuming official plugins (reset, icons, fonts, typography, and design tokens)
- Troubleshooting transforms, generated files, TypeScript declarations, or configuration reloads
- Choosing neutral or Node.js runtime adapters for plugins that load local resources
- Creating a new engine plugin from scratch
- Implementing plugin hooks, structured diagnostics, and lifecycle behavior
- Extending `EngineConfig` with module augmentation
- Registering external configuration dependencies for file watching
- Writing plugin tests

### How to Trigger

The skill is automatically activated when your question relates to PikaCSS usage or plugin development. You can also explicitly mention "using PikaCSS", "PikaCSS setup", or "PikaCSS plugin development" in your prompt.

### Coverage

- Installation and build tool integration (Vite, Webpack, Rollup, esbuild, Rspack, Rolldown, and Nuxt)
- Node.js, Vite, source-file, and static-analysis compatibility constraints
- Engine configuration and customization
- Generated CSS and TypeScript declaration files
- The `pika()`, `pika.str()`, `pika.arr()`, and `pikap()` functions
- Official plugin consumption and configuration
- Neutral and Node.js plugin entry points
- ESLint integration
- TypeScript autocomplete support
- Plugin structure and `defineEnginePlugin`
- Lifecycle hooks, hook context, diagnostics, and execution order
- Config augmentation via TypeScript module augmentation
- Layer management and preflight injection
- Selector, shortcut, variable, keyframe, and design-token registration
- External config dependency watching
- Plugin testing patterns using `createEngine`

## Next

- [Setup](/getting-started/setup) — install PikaCSS in your project.
- [Plugin Development](/plugin-development/create-a-plugin) — create your own plugins.
