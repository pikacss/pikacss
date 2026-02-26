# Webpack Integration

PikaCSS integrates with [webpack](https://webpack.js.org/) via the `@pikacss/unplugin-pikacss/webpack` entry point.

## Install

::: code-group
<<< @/.examples/integrations/install-unplugin.sh [pnpm]
<<< @/.examples/integrations/install-unplugin-npm.sh [npm]
<<< @/.examples/integrations/install-unplugin-yarn.sh [yarn]
<<< @/.examples/integrations/install-unplugin-bun.sh [bun]
:::

## Configure webpack

Add the PikaCSS plugin to your webpack configuration:

::: code-group
<<< @/.examples/integrations/webpack.config.mjs [ESM]
:::

::: tip ESM config files
webpack supports ESM config files via `.mjs` extension or `"type": "module"` in your `package.json`.
:::

## Import Generated CSS

Add the following import to your application entry file:

<<< @/.examples/integrations/entry.ts

`pika.css` is a virtual module resolved by the plugin at build time. It points to the generated CSS output file (`pika.gen.css` by default).

## Plugin Options

All unplugin adapters share the same options. See the [Rollup Integration](/integrations/rollup#plugin-options) page for the full options table — the options are identical across all build tool adapters.

## How It Works

The webpack adapter is a thin `createWebpackPlugin(unpluginFactory)` wrapper. It shares the same transform pipeline and codegen logic as all other unplugin adapters. The plugin:

1. Scans source files for `pika()` calls during the build.
2. Replaces each call with the generated atomic class name string.
3. Writes atomic CSS rules to the codegen output file.
4. Resolves `pika.css` imports to the generated CSS file.

In webpack specifically, the shared factory uses the compiler context to determine `cwd` and reads the webpack `mode` (`'development'` → serve, otherwise → build) to configure the integration.

## Next

- [Rspack](/integrations/rspack)
