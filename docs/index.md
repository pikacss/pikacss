---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "PikaCSS"
  text: "Instant on-demand Atomic CSS-in-JS"
  tagline: Write styles with familiar CSS-in-JS syntax, get full TypeScript autocomplete, and compile to optimized atomic CSS at build time — zero runtime cost.
  image:
    src: /logo-white.svg
    alt: PikaCSS Logo
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started/what-is-pikacss
    - theme: alt
      text: Explore Integrations
      link: /integrations/overview

features:
  - icon: ⚡
    title: Zero Runtime
    details: All styling work happens at build time. Your production bundle ships plain class name strings and a static CSS file — no runtime overhead.
  - icon: 🧩
    title: Atomic CSS Output
    details: Each CSS property-value pair becomes a unique, reusable atomic class. Shared styles are deduplicated automatically, keeping CSS size minimal.
  - icon: ⚙️
    title: Zero Config by Default
    details: Start with sensible defaults. PikaCSS auto-discovers or creates a config file when needed — no boilerplate required.
  - icon: 🧠
    title: Predictable Build-time Input
    details: Style arguments are evaluated at build time via `new Function(...)`, and the recommended workflow keeps them in a literal-only subset. The ESLint package can enforce that subset for teams.
  - icon: 🤖
    title: TypeScript Auto-Completion
    details: Full typed style authoring with generated autocomplete support. CSS properties, values, selectors, and plugin-defined tokens are all type-safe.
  - icon: 🔌
    title: Universal Build Tool Support
    details: One engine across Vite, Rollup, Webpack, esbuild, Rspack, Rolldown, and Nuxt via `@pikacss/unplugin-pikacss`.
  - icon: 🎨
    title: Nested Selectors & Variants
    details: Supports pseudo-classes, pseudo-elements, media queries, and custom selectors inline within your style definitions.
  - icon: 🧰
    title: Extensible Plugin System
    details: 5 built-in plugins (variables, keyframes, selectors, shortcuts, important) plus external plugins for icons, CSS resets, and typography.

---
