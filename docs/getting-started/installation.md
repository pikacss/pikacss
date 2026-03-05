# Installation

This guide uses **Vite** as the primary path. PikaCSS also supports Rollup, Webpack, Rspack, esbuild, Rolldown, and Nuxt — see [Other Build Tools](#other-build-tools) below.

## 1) Install the Package

Install `@pikacss/unplugin-pikacss` as a dev dependency. This is the universal build plugin that integrates PikaCSS into your project's build pipeline.

::: code-group
<<< @/.examples/getting-started/install-unplugin.sh [pnpm]
<<< @/.examples/getting-started/install-unplugin-npm.sh [npm]
<<< @/.examples/getting-started/install-unplugin-yarn.sh [yarn]
<<< @/.examples/getting-started/install-unplugin-bun.sh [bun]
:::

::: tip What does this package include?
`@pikacss/unplugin-pikacss` bundles everything you need to get started — the core engine (`@pikacss/core`) and the build integration (`@pikacss/integration`) are included as transitive dependencies. You do **not** need to install them separately.
:::

## 2) Register the Vite Plugin

Import the Vite-specific entry point and add it to your Vite config:

<<< @/.examples/getting-started/vite.config.ts

The plugin handles file scanning, code transformation, and CSS generation automatically.

## 3) Import the Generated CSS

Add the following import to your application entry file (e.g., `src/main.ts`):

<<< @/.examples/getting-started/main-entry.ts

`pika.css` is a **virtual module** resolved by the plugin at build time. It points to the generated CSS output file (`pika.gen.css` by default) which contains all the atomic CSS rules extracted from your source code.

## 4) Configuration File (Optional)

On first run with default settings (`autoCreateConfig: true`), PikaCSS automatically creates a `pika.config.ts` file in your project root if one doesn't already exist. You can also create it manually:

<<< @/.examples/getting-started/pika.config.ts

PikaCSS auto-detects config files matching these patterns:
- `pika.config.{js,cjs,mjs,ts,cts,mts}`
- `pikacss.config.{js,cjs,mjs,ts,cts,mts}`

`defineEngineConfig` is re-exported from `@pikacss/unplugin-pikacss` for convenience — no extra imports needed.

## Generated Files

When you start your dev server or run a build, the plugin generates two files by default:

| File | Description |
| --- | --- |
| `pika.gen.css` | Compiled atomic CSS rules extracted from `pika()` calls |
| `pika.gen.ts` | TypeScript declarations providing autocomplete for your custom selectors, shortcuts, and variables |

::: warning pika.gen.ts Is a Type Declaration — Not an Import Source
`pika.gen.ts` uses `declare global` to register `pika` as a global function. It provides TypeScript autocomplete support but is **not** a module you import `pika` from. You never write `import { pika } from './pika.gen'` — `pika()` is available globally in all source files scanned by the build plugin.
:::

You can customize their output paths via plugin options:

```ts
PikaCSS({
  tsCodegen: './src/pika.gen.ts',
  cssCodegen: './src/pika.gen.css',
})
```

Set `tsCodegen: false` to disable TypeScript code generation entirely.

## Official Plugins (Optional) {#official-plugins}

PikaCSS offers official plugins for common needs. Install only the ones you need:

<<< @/.examples/getting-started/install-plugins.sh [pnpm]

| Package | Description |
| --- | --- |
| `@pikacss/plugin-reset` | CSS reset presets (`'modern-normalize'`, `'normalize'`, `'eric-meyer'`, `'andy-bell'`, `'the-new-css-reset'`) |
| `@pikacss/plugin-icons` | Icon support via [@iconify](https://iconify.design/) integration |
| `@pikacss/plugin-typography` | Typography / prose styling plugin |

All plugins have `@pikacss/core` as a peer dependency, which is already installed via `@pikacss/unplugin-pikacss`.

Register plugins in your config file:

<<< @/.examples/getting-started/pika.config.with-plugins.ts

## Other Build Tools {#other-build-tools}

`@pikacss/unplugin-pikacss` provides entry points for all major build tools. The import path determines which adapter is used:

| Build Tool | Import Path |
| --- | --- |
| Vite | `@pikacss/unplugin-pikacss/vite` |
| Rollup | `@pikacss/unplugin-pikacss/rollup` |
| Webpack | `@pikacss/unplugin-pikacss/webpack` |
| esbuild | `@pikacss/unplugin-pikacss/esbuild` |
| Rspack | `@pikacss/unplugin-pikacss/rspack` |
| Rolldown | `@pikacss/unplugin-pikacss/rolldown` |

All adapters share the same plugin options and behavior — they are thin wrappers around the same core `unpluginFactory`.

For detailed setup instructions per build tool, see the [Integrations Overview](/integrations/overview).

### Nuxt

Nuxt has a dedicated module wrapper:

<<< @/.examples/getting-started/install-nuxt.sh [pnpm]

<<< @/.examples/getting-started/nuxt.config.ts

The Nuxt module automatically registers the Vite plugin with `enforce: 'pre'` and imports `pika.css` for you — no manual CSS import is needed. See [Nuxt Integration](/integrations/nuxt) for details.

## Next

- Continue to [Zero Config](/getting-started/zero-config)
