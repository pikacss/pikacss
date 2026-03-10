# What Is PikaCSS?

PikaCSS is a build-time atomic CSS-in-JS engine. You write style definitions in JavaScript or TypeScript, the integration scans supported files for `pika()` calls, and the build transforms those calls into class names plus a generated CSS file.

That makes PikaCSS a good fit for teams that want:

- CSS-in-JS authoring without runtime styling cost.
- Full TypeScript autocomplete for style definitions and plugin-defined tokens.
- Reusable selectors, shortcuts, variables, and keyframes in the same authoring model.
- Predictable CSS output that can be inspected as generated files.

It is a poor fit if your design system depends on arbitrary runtime expressions inside styling calls. PikaCSS is opinionated: inputs must be statically analyzable because the engine works at build time.

::: tip When PikaCSS shines
PikaCSS is strongest when styles are known from source code structure: component variants, responsive rules, theme selectors, design tokens, and reusable shortcuts.
:::

## The core idea

PikaCSS does three things well:

1. It treats `pika()` as build input, not runtime logic.
2. It decomposes style definitions into atomic declarations and deduplicates them.
3. It keeps public extension points for selectors, shortcuts, variables, keyframes, preflights, and plugins.

<<< @/.examples/getting-started/pika-basic-usage.ts

## What makes it different

Most CSS-in-JS tools optimize for runtime flexibility. Most utility-first tools optimize for predeclared tokens. PikaCSS sits in a different place:

- You still author style objects directly.
- The final application ships static CSS, not runtime style injection.
- You can extend the engine with plugin hooks instead of forcing every workflow into utility class conventions.

## What it does not promise

PikaCSS does not promise that any valid JavaScript expression can become style input. The engine cannot safely optimize expressions it cannot analyze up front.

::: warning Do not evaluate PikaCSS like a runtime API
If you judge PikaCSS by trying dynamic function calls, mutable state, ternaries that depend on runtime data, or computed member access inside `pika()`, you are testing the wrong model.
:::

## Built-in capabilities you will actually use

- Variables for theme tokens and scoped custom properties.
- Selectors for pseudo states, media queries, and custom aliases.
- Shortcuts for reusable style bundles.
- Keyframes for animation registration with autocomplete.
- Preflights and layers for global and ordered CSS.

## Who should read what next

- New adopters should continue to [Installation](/getting-started/installation).
- Teams evaluating the tradeoffs should read [Static Arguments](/getting-started/static-arguments) immediately after setup.
- Plugin authors should skip ahead to [Plugin System Overview](/plugin-system/overview).

## Next

- [Installation](/getting-started/installation)
- [First Pika](/getting-started/first-pika)
- [Static Arguments](/getting-started/static-arguments)
- [How PikaCSS Works](/concepts/how-pikacss-works)
