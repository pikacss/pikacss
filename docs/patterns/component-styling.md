# Component Styling

The most reliable PikaCSS components are built from small, static layers.

## Start with composition, not conditionals

Base styles, variant styles, and local overrides should usually be separate arguments.

<<< @/.examples/getting-started/first-pika-multiple-args.vue

This pattern scales because each piece has a stable purpose:

- base styles define structure
- variant styles define intent
- local overrides solve one-off layout or context needs

## Use shortcuts for shared recipes

When the same style bundle appears across multiple components, move it into a shortcut instead of repeating a large object in every file.

<<< @/.examples/guide/shortcuts-config.ts

<<< @/.examples/guide/shortcuts-usage.ts

<<< @/.examples/guide/shortcuts-output.css

## Prefer explicit variants

For component states such as `primary`, `secondary`, `danger`, or `compact`, create separate static style blocks and choose between them at runtime.

::: tip Good runtime usage
Runtime code should decide which static class string to use. Runtime code should not build the style content itself.
:::

## Recommended review checklist

| Ask this | Why it matters |
| --- | --- |
| Can this repeated block become a shortcut? | It reduces duplication and sharpens intent. |
| Is this variant stable enough to name? | Named variants are easier to review than ad hoc overrides. |
| Is theme data actually a CSS variable problem? | Variables usually age better than repeated color branches. |
| Is this local override still static? | If not, the build-time model will fight you. |

## Do and do not

| Do | Do not |
| --- | --- |
| Compose `pika(base, primary, localOverride)`. | Put every possible branch in one inline expression. |
| Move shared recipes into shortcuts. | Copy the same 12-line object across files. |
| Keep variants stable and named. | Invent new dynamic shape rules per component. |

## Next

- [Responsive And Selectors](/patterns/responsive-and-selectors)
- [Theming And Variables](/patterns/theming-and-variables)
- [Configuration](/guide/configuration)
- [Static Arguments](/getting-started/static-arguments)
