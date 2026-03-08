# Integrations Overview

PikaCSS integrates into your build pipeline through [`@pikacss/unplugin-pikacss`](https://www.npmjs.com/package/@pikacss/unplugin-pikacss), a universal build plugin powered by [unplugin](https://github.com/unjs/unplugin). A dedicated [Nuxt module](#nuxt) is also available for Nuxt projects.

## Supported Build Tools

All build-tool plugins are thin adapters around the same core `unpluginFactory`. They share identical options, transform logic, and code generation behavior.

| Build Tool | Package Import | Guide |
|---|---|---|
| **Vite** | `@pikacss/unplugin-pikacss/vite` | [Vite →](/integrations/vite) |
| **Rollup** | `@pikacss/unplugin-pikacss/rollup` | [Rollup →](/integrations/rollup) |
| **Webpack** | `@pikacss/unplugin-pikacss/webpack` | [Webpack →](/integrations/webpack) |
| **esbuild** | `@pikacss/unplugin-pikacss/esbuild` | [esbuild →](/integrations/esbuild) |
| **Rspack** | `@pikacss/unplugin-pikacss/rspack` | [Rspack →](/integrations/rspack) |
| **Rolldown** | `@pikacss/unplugin-pikacss/rolldown` | [Rolldown →](/integrations/rolldown) |
| **Nuxt** | `@pikacss/nuxt-pikacss` | [Nuxt →](/integrations/nuxt) |

## Custom Build Tools

If your bundler or compiler is not covered by the official adapters, build directly on top of `createCtx()` from `@pikacss/integration`.

[Custom Build Tool Integration →](/integrations/custom-integration)

## Development Tools

PikaCSS also provides developer tooling to enforce best practices and catch errors during development.

| Tool | Package | Purpose |
|---|---|---|
| **ESLint** | `@pikacss/eslint-config` | Enforce build-time constraints on `pika()` calls |

[ESLint Plugin →](/integrations/eslint)

## Quick Setup Examples

::: code-group

<<< @/.examples/integrations/vite-setup.ts [Vite]

<<< @/.examples/integrations/rollup-setup.ts [Rollup]

<<< @/.examples/integrations/webpack-setup.ts [Webpack]

<<< @/.examples/integrations/esbuild-setup.ts [esbuild]

<<< @/.examples/integrations/rspack-setup.ts [Rspack]

<<< @/.examples/integrations/rolldown-setup.ts [Rolldown]

<<< @/.examples/integrations/nuxt-setup.ts [Nuxt]

:::

## Plugin Options

All build-tool plugins accept the same `PluginOptions` interface:

<<< @/.examples/integrations/plugin-options.ts

### Options Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `scan.include` | `string \| string[]` | `['**/*.{js,ts,jsx,tsx,vue}']` | File glob patterns to scan for `pika()` calls |
| `scan.exclude` | `string \| string[]` | `['node_modules/**', 'dist/**']` | File glob patterns to exclude from scanning |
| `config` | `EngineConfig \| string` | `undefined` | Inline engine config object, or path to a config file |
| `autoCreateConfig` | `boolean` | `true` | Auto-create a `pika.config.ts` file if none exists |
| `fnName` | `string` | `'pika'` | Function name to detect and transform in source code |
| `transformedFormat` | `'string' \| 'array'` | `'string'` | Output format of generated class names |
| `tsCodegen` | `boolean \| string` | `true` | TypeScript codegen file path (`true` → `'pika.gen.ts'`, `false` to disable) |
| `cssCodegen` | `true \| string` | `true` | CSS codegen file path (`true` → `'pika.gen.css'`; `false` is not supported) |

## Generated Files

The plugin generates two files in your project root during build:

- **`pika.gen.css`** — Contains all extracted atomic CSS rules. This is the actual CSS output consumed by the virtual module.
- **`pika.gen.ts`** — Provides TypeScript type augmentation for autocomplete and type-checking of `pika()` calls (custom selectors, shortcuts, variables, etc.).

You should add both files to your `.gitignore`:

<<< @/.examples/integrations/generated-files.gitignore

## Virtual CSS Module (`pika.css`)

PikaCSS provides a virtual module named `pika.css` that resolves to the generated CSS file. Import it in your application entry point to include all atomic styles:

<<< @/.examples/integrations/import-pika-css.ts

::: tip How it works
When the build plugin encounters `import 'pika.css'`, it resolves the import to the generated `pika.gen.css` file. This works across all supported build tools — no physical `pika.css` file is needed in your project.
:::

## Configuration File

When `autoCreateConfig` is `true` (the default), the plugin will auto-create a `pika.config.js` file if one does not already exist. The config file is auto-detected with the following names:

- `pika.config.js`
- `pika.config.cjs`
- `pika.config.mjs`
- `pika.config.ts`
- `pika.config.cts`
- `pika.config.mts`
- `pikacss.config.js`
- `pikacss.config.cjs`
- `pikacss.config.mjs`
- `pikacss.config.ts`
- `pikacss.config.cts`
- `pikacss.config.mts`

The plugin watches the config file for changes and automatically reloads when it is modified.

## Nuxt

The `@pikacss/nuxt-pikacss` package wraps the Vite plugin as a Nuxt module. It:

- Automatically registers the Vite plugin with `enforce: 'pre'`
- Injects `import 'pika.css'` via a Nuxt plugin template — no manual import needed
- Defaults `scan.include` to `['**/*.vue', '**/*.tsx', '**/*.jsx']`
- Exposes options under the `pikacss` config key in `nuxt.config.ts`

<<< @/.examples/integrations/nuxt-setup.ts

See the [Nuxt integration guide](/integrations/nuxt) for full details.

## Recommended Learning Path

We recommend starting with the **Vite** integration as the primary learning path, then branching out to other build tools as needed:

1. [Vite](/integrations/vite) — Primary, most common setup
2. [Rollup](/integrations/rollup) / [Rolldown](/integrations/rolldown) — Rollup-family bundlers
3. [esbuild](/integrations/esbuild) — Fast bundler with minimal config
4. [Webpack](/integrations/webpack) / [Rspack](/integrations/rspack) — Webpack-family bundlers
5. [Nuxt](/integrations/nuxt) — Framework-level integration

## Next

- Start with [Vite](/integrations/vite)
- See [Nuxt](/integrations/nuxt)
- Build a [Custom Integration](/integrations/custom-integration)
