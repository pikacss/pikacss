# Rspack Integration

PikaCSS integrates with [Rspack](https://rspack.dev/) via the `@pikacss/unplugin-pikacss/rspack` entry point.

## Install

::: code-group
<<< @/.examples/integrations/install-unplugin.sh [pnpm]
<<< @/.examples/integrations/install-unplugin-npm.sh [npm]
<<< @/.examples/integrations/install-unplugin-yarn.sh [yarn]
<<< @/.examples/integrations/install-unplugin-bun.sh [bun]
:::

## Configure Rspack

Add the PikaCSS plugin to your Rspack configuration:

::: code-group
<<< @/.examples/integrations/rspack.config.mjs [ESM]
:::

::: tip
Rspack supports ESM (`.mjs`) config files.
:::

## Import Generated CSS

Add the following import to your application entry file:

<<< @/.examples/integrations/entry.ts

`pika.css` is a virtual module resolved by the plugin at build time. It points to the generated CSS output file (`pika.gen.css` by default).

## Plugin Options

All unplugin adapters share the same options. See the [Rollup Integration](/integrations/rollup#plugin-options) page for the full options table — the options are identical across all build tool adapters.

## How It Works

The Rspack adapter is a thin `createRspackPlugin(unpluginFactory)` wrapper. It shares the same transform pipeline and codegen logic as all other unplugin adapters. The plugin:

1. Scans source files for `pika()` calls during the build.
2. Replaces each call with the generated atomic class name string.
3. Writes atomic CSS rules to the codegen output file.
4. Resolves `pika.css` imports to the generated CSS file.

In Rspack specifically, the shared factory uses the compiler context to determine `cwd` and reads the `mode` (`'development'` → serve, otherwise → build). It also supports config reload via Rspack's watching/invalidation hooks.

## Next

- [Esbuild](/integrations/esbuild)
- [Webpack](/integrations/webpack)
- [Integrations Overview](/integrations/overview)
