---
title: Agent Skills
description: AI-assisted development skill for using and extending PikaCSS.
relatedPackages:
  - '@pikacss/core'
relatedSources: []
category: integrations
order: 30
---

# Agent Skills

PikaCSS ships with a Copilot agent skill that provides AI-assisted guidance for both consuming and extending PikaCSS. You can install it with the [`skills` CLI](https://www.npmjs.com/package/skills) to use it in any supported coding agent.

## Install

```bash
npx skills add pikacss/pikacss --skill pikacss-use
```

## pikacss-use

### When to Use

Use this skill when you are working with PikaCSS in any capacity:

- Setting up PikaCSS in a new project
- Configuring engine options or build plugins
- Using `pika()` and its variants
- Consuming official plugins (reset, icons, fonts, typography)
- Troubleshooting build or runtime issues
- Creating a new engine plugin from scratch
- Implementing plugin hooks and lifecycle
- Extending `EngineConfig` with module augmentation
- Writing plugin tests

### How to Trigger

The skill is automatically activated when your question relates to PikaCSS usage or plugin development. You can also explicitly mention "using PikaCSS", "PikaCSS setup", or "PikaCSS plugin development" in your prompt.

### Coverage

- Installation and build tool integration (Vite, Webpack, Nuxt, etc.)
- Engine configuration and customization
- The `pika()`, `pika.str()`, `pika.arr()`, and `pikap()` functions
- Official plugin consumption and configuration
- ESLint integration
- TypeScript autocomplete support
- Plugin structure and `defineEnginePlugin`
- Lifecycle hooks and execution order
- Config augmentation via TypeScript module augmentation
- Layer management and preflight injection
- Selector, shortcut, variable, and keyframe registration
- Plugin testing patterns

## Next

- [Setup](/getting-started/setup) — install PikaCSS in your project.
- [Plugin Development](/plugin-development/create-a-plugin) — create your own plugins.
