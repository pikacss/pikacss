# Configuration

PikaCSS configuration has two layers, and confusing them is one of the easiest ways to misread the system.

1. Engine config controls how styles are understood and rendered.
2. Build plugin options control how the integration finds, transforms, and generates files.

## Engine config

Use engine config for things that change styling behavior:

- plugins
- autocomplete
- selectors
- shortcuts
- variables
- keyframes
- layers
- preflights
- prefix and selector defaults

<<< @/.examples/guide/config-basic.ts

<<< @/.examples/guide/config-full-example.ts

## Custom autocomplete

Use `autocomplete` when your app or design system has stable custom style tokens that do not come from a plugin.

These entries are merged with built-in and external plugin autocomplete, then written into the generated TypeScript types.

<<< @/.examples/guide/config-autocomplete.ts

## Semantic variable autocomplete

Use `variables.*.semanticType` when a CSS variable represents a stable value family and you want PikaCSS to attach `var(--token)` only to matching CSS property autocomplete.

Current built-in semantic families with runtime expansion are:

- `color`
- `length`
- `time`
- `number`
- `easing`
- `font-family`

`semanticType` expands to the built-in property set first, then unions with any explicit `autocomplete.asValueOf` entries you add for project-specific outliers.

<<< @/.examples/guide/config-variables-semantic-type.ts

## Built-in plugins are configured by top-level keys

This is important because built-in plugin configuration does not live inside `plugins`.

<<< @/.examples/guide/built-in-plugins-config.ts

| Built-in capability | Where to configure it |
| --- | --- |
| variables | `variables` |
| keyframes | `keyframes` |
| selectors | `selectors` |
| shortcuts | `shortcuts` |
| important | `important` |

## External plugins go in `plugins`

<<< @/.examples/guide/config-plugins.ts

::: warning Common misunderstanding
If you put official external plugins such as reset, fonts, icons, or typography under built-in config keys, nothing useful happens. Built-in plugin config and external plugin registration are two different mechanisms.
:::

## Build plugin options

Use build plugin options for integration behavior such as scanning, config path resolution, generated file locations, and function name detection.

<<< @/.examples/integrations/plugin-options.ts

## Layers, preflights, and ordering

For larger systems, layer control matters because it makes output order intentional instead of accidental.

<<< @/.examples/guide/config-layers.ts

<<< @/.examples/guide/config-preflights-with-layer.ts

## Type helpers

PikaCSS exports identity helpers that improve autocomplete and document intent.

- `defineEngineConfig()`
- `defineStyleDefinition()`
- `defineSelector()`
- `defineShortcut()`
- `defineKeyframes()`
- `defineVariables()`
- `defineEnginePlugin()`

<<< @/.examples/guide/built-ins/style-definition-define-helper.ts

## What most teams should standardize

- shared selectors
- token variables
- shortcut naming
- plugin usage
- layer strategy
- ESLint enforcement for static inputs

## Next

- [Generated Files](/guide/generated-files)
- [Integrations Overview](/integrations/overview)
- [Theming And Variables](/patterns/theming-and-variables)
- [Plugin System Overview](/plugin-system/overview)
