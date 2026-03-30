---
title: Agent Skills
description: AI-assisted development skills for using and extending PikaCSS.
relatedPackages:
  - '@pikacss/core'
relatedSources: []
category: integrations
order: 30
---

# Agent Skills

PikaCSS ships with two Copilot agent skills that provide AI-assisted guidance for using and developing PikaCSS.

## pikacss-use

### When to Use

Use this skill when you are consuming PikaCSS in an application project:

- Setting up PikaCSS in a new project
- Configuring engine options or build plugins
- Using `pika()` and its variants
- Consuming official plugins (reset, icons, fonts, typography)
- Troubleshooting build or runtime issues

### How to Trigger

The skill is automatically activated when your question relates to PikaCSS consumer usage patterns. You can also explicitly mention "using PikaCSS" or "PikaCSS setup" in your prompt.

### Coverage

- Installation and build tool integration (Vite, Webpack, Nuxt, etc.)
- Engine configuration and customization
- The `pika()`, `pika.str()`, `pika.arr()`, and `pikap()` functions
- Official plugin consumption and configuration
- ESLint integration
- TypeScript autocomplete support

## pikacss-develop-plugin

### When to Use

Use this skill when you are authoring or modifying a PikaCSS engine plugin:

- Creating a new plugin from scratch
- Implementing plugin hooks
- Extending `EngineConfig` with module augmentation
- Writing plugin tests

### How to Trigger

The skill is automatically activated when your question relates to plugin authoring. You can also explicitly mention "plugin development" or "create a PikaCSS plugin" in your prompt.

### Coverage

- Plugin structure and `defineEnginePlugin`
- Lifecycle hooks and execution order
- Config augmentation via TypeScript module augmentation
- Layer management and preflight injection
- Selector, shortcut, variable, and keyframe registration
- Plugin testing patterns

## Next

- [Setup](/getting-started/setup) — install PikaCSS in your project.
- [Plugin Development](/plugin-development/create-a-plugin) — create your own plugins.
