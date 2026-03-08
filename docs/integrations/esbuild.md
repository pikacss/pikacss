# Esbuild Integration

PikaCSS integrates with [esbuild](https://esbuild.github.io/) via the `@pikacss/unplugin-pikacss/esbuild` entry point.

## Install

::: code-group
<<< @/.examples/integrations/install-unplugin.sh [pnpm]
<<< @/.examples/integrations/install-unplugin-npm.sh [npm]
<<< @/.examples/integrations/install-unplugin-yarn.sh [yarn]
<<< @/.examples/integrations/install-unplugin-bun.sh [bun]
:::

## Configure esbuild

Since esbuild does not use a config file, add the PikaCSS plugin in your build script:

<<< @/.examples/integrations/esbuild.build.ts

## Import Generated CSS

Add the following import to your application entry file:

<<< @/.examples/integrations/entry.ts

`pika.css` is a virtual module resolved by the plugin at build time. It points to the generated CSS output file (`pika.gen.css` by default).

## Plugin Options

All unplugin adapters share the same options. See the [Rollup Integration](/integrations/rollup#plugin-options) page for the full options table — the options are identical across all build tool adapters.

## How It Works

The esbuild adapter is a thin `createEsbuildPlugin(unpluginFactory)` wrapper. It shares the same transform pipeline and codegen logic as all other unplugin adapters. The plugin:

1. Scans source files for `pika()` calls during the build.
2. Replaces each call with the generated atomic class name string.
3. Writes atomic CSS rules to the codegen output file.
4. Resolves `pika.css` imports to the generated CSS file.

In esbuild specifically, the plugin uses an `onResolve` hook to handle the `pika.css` virtual module, resolving it directly to the generated CSS codegen filepath.

## Next

- [Rolldown](/integrations/rolldown)
- [Integrations Overview](/integrations/overview)
- [Configuration](/guide/configuration)
