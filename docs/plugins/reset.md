# Reset Plugin

`@pikacss/plugin-reset` injects a CSS reset stylesheet into PikaCSS preflights. It ships with 5 popular reset presets and uses `modern-normalize` by default.

## Installation

::: code-group
<<< @/.examples/plugins/reset-install.sh [pnpm]
<<< @/.examples/plugins/reset-install-npm.sh [npm]
<<< @/.examples/plugins/reset-install-yarn.sh [yarn]
:::

`@pikacss/core` is required as a peer dependency.

## Basic Usage

Add the `reset()` plugin to your engine config. With no `reset` option, it defaults to `'modern-normalize'`:

<<< @/.examples/plugins/reset-basic-usage.ts

## Choosing a Preset

Set the `reset` config field to select a different preset:

<<< @/.examples/plugins/reset-custom-preset.ts

## Available Presets

The plugin bundles 5 CSS reset stylesheets:

<<< @/.examples/plugins/reset-all-presets.ts

| Preset | Description |
|--------|-------------|
| `'modern-normalize'` | **Default.** Normalizes styles for modern browsers. Based on [modern-normalize](https://github.com/sindresorhus/modern-normalize). |
| `'normalize'` | Classic [Normalize.css](https://necolas.github.io/normalize.css/) — makes browsers render elements consistently. |
| `'eric-meyer'` | [Eric Meyer's CSS reset](https://meyerweb.com/eric/tools/css/reset/) — strips all default browser styles to a blank slate. |
| `'andy-bell'` | [Andy Bell's modern CSS reset](https://piccalil.li/blog/a-modern-css-reset/) — a minimal, opinionated reset for modern development. |
| `'the-new-css-reset'` | [The New CSS Reset](https://elad2412.github.io/the-new-css-reset/) — removes all default styles using `all: unset`. |

## How It Works

The plugin uses `order: 'pre'`, which means it runs **before** other plugins. This ensures the reset CSS is always the first preflight injected, so your other styles and plugins can build on top of a consistent baseline.

Internally, the plugin:

1. Reads the `config.reset` field during the `configureRawConfig` hook
2. Falls back to `'modern-normalize'` if no value is set
3. Defaults `config.layers.reset` to `-1` to ensure the reset layer renders first
4. Loads the corresponding CSS string from bundled preset files
5. Injects the CSS via `engine.addPreflight({ layer: 'reset', preflight: resetCss })` during the `configureEngine` hook

## Using with Other Plugins

The reset plugin pairs naturally with other PikaCSS plugins. Since it runs with `order: 'pre'`, its styles are always injected first regardless of plugin array order:

<<< @/.examples/plugins/reset-with-other-plugins.ts

## Type Augmentation

The plugin augments `EngineConfig` from `@pikacss/core` with:

<<< @/.examples/plugins/reset-engine-config-interface.ts

This gives you full TypeScript autocomplete when setting the `reset` option in your config.

## Plugin Details

| Property | Value |
|----------|-------|
| Plugin name | `'reset'` |
| Order | `'pre'` |
| Package | `@pikacss/plugin-reset` |
| Default preset | `'modern-normalize'` |

## Next

- [Icons Plugin](/plugins/icons)
- [Typography Plugin](/plugins/typography)
- [Create Your Own Plugin](/plugin-system/create-plugin)
