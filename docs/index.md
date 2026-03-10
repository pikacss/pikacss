---
layout: home

hero:
  name: PikaCSS
  text: Build-time atomic CSS-in-JS that still feels like writing CSS
  tagline: Use familiar style objects, get full TypeScript autocomplete, ship static CSS, and keep overlapping atomic declarations predictable instead of hoping global utility order works out.
  image:
    src: /logo-white.svg
    alt: PikaCSS logo
  actions:
    - theme: brand
      text: Start Here
      link: /getting-started/installation
    - theme: alt
      text: Learn Real Patterns
      link: /patterns/component-styling
    - theme: alt
      text: Build Plugins
      link: /plugin-system/overview

features:
  - icon: ⚙️
    title: CSS-in-JS authoring, build-time output
    details: Write style definitions in JavaScript or TypeScript, then let PikaCSS turn them into static atomic CSS during the build.
  - icon: 🧠
    title: Static on purpose
    details: PikaCSS optimizes aggressively because inputs must be statically analyzable. The docs show where that boundary helps and where it will surprise you.
  - icon: 🧩
    title: Real CSS composition
    details: Use variables, selectors, shortcuts, keyframes, layers, and plugins without switching mental models between utility classes and handwritten CSS.
  - icon: 🔌
    title: One engine, multiple integrations
    details: Start with Vite, Nuxt, Rollup, Webpack, Rspack, Rolldown, or esbuild without changing how you author styles.
  - icon: 🛠️
    title: Plugin system with public APIs
    details: Extend selectors, shortcuts, variables, keyframes, preflights, and autocomplete through a consistent hook system.
  - icon: 📚
    title: Docs for both adopters and extenders
    details: The main path targets product teams using PikaCSS daily. Advanced sections cover plugin authors and contributors separately.

---

## Start with the constraints, not after them

PikaCSS is strongest when your team wants the ergonomics of typed CSS-in-JS without paying runtime styling costs in production. It is not trying to be a runtime styling system, and it is not pretending dynamic expressions can always be optimized away.

Its most practical advantage is that it does not treat atomic reuse as more important than correct cascade behavior. When declarations overlap, PikaCSS keeps later author intent local and predictable instead of letting the final result depend on whichever shared utility happened to be emitted later in the global stylesheet.

That tradeoff is the whole point. If you accept statically analyzable inputs, PikaCSS can generate deduplicated atomic CSS, complete autocomplete, and predictable output. If you need arbitrary runtime styling, you should know that before you adopt it.

::: warning What to read first
Do not skip [Static Arguments](/getting-started/static-arguments). Most incorrect first impressions of PikaCSS come from assuming `pika()` behaves like a runtime function.
:::

## A practical reading path

1. Read [What Is PikaCSS?](/getting-started/what-is-pikacss) to decide if the engine fits your constraints.
2. Follow [Installation](/getting-started/installation) and [First Pika](/getting-started/first-pika) to get one successful flow working.
3. Read [Static Arguments](/getting-started/static-arguments) before you scale usage across a team.
4. Move into [Component Styling](/patterns/component-styling), [Responsive And Selectors](/patterns/responsive-and-selectors), and [Theming And Variables](/patterns/theming-and-variables) for real project patterns.
5. Keep [Common Problems](/troubleshooting/common-problems) open when something looks missing or incorrect.

## For plugin authors and contributors

The primary docs path is intentionally user-first. If you are extending the engine instead of only consuming it, jump to [Plugin System Overview](/plugin-system/overview) and [Contributor Architecture](/contributors/architecture).

## Next

- [What Is PikaCSS?](/getting-started/what-is-pikacss)
- [Installation](/getting-started/installation)
- [Component Styling](/patterns/component-styling)
- [Plugin System Overview](/plugin-system/overview)
