# Rollup Integration

PikaCSS integrates with [Rollup](https://rollupjs.org/) via the `@pikacss/unplugin-pikacss/rollup` entry point.

## Install

::: code-group
<<< @/.examples/integrations/install-unplugin.sh [pnpm]
<<< @/.examples/integrations/install-unplugin-npm.sh [npm]
<<< @/.examples/integrations/install-unplugin-yarn.sh [yarn]
<<< @/.examples/integrations/install-unplugin-bun.sh [bun]
:::

## Configure Rollup

Add the PikaCSS plugin to your Rollup configuration:

<<< @/.examples/integrations/rollup.config.ts

## Import Generated CSS

Add the following import to your application entry file:

<<< @/.examples/integrations/entry.ts

`pika.css` is a virtual module resolved by the plugin at build time. It points to the generated CSS output file (`pika.gen.css` by default).

## Plugin Options

All unplugin adapters share the same options. You can customize the plugin behavior by passing an options object:

<<< @/.examples/integrations/rollup.config.with-options.ts

### Default Values

| Option | Default | Description |
| --- | --- | --- |
| `scan.include` | `['**/*.{js,ts,jsx,tsx,vue}']` | File glob patterns to scan |
| `scan.exclude` | `['node_modules/**', 'dist/**']` | File glob patterns to exclude |
| `fnName` | `'pika'` | Function name to detect in source code |
| `transformedFormat` | `'string'` | Output format: `'string'` or `'array'` |
| `autoCreateConfig` | `true` | Auto-create `pika.config.js` if not found |
| `tsCodegen` | `true` → `'pika.gen.ts'` | TypeScript codegen file path, or `false` to disable |
| `cssCodegen` | `true` → `'pika.gen.css'` | CSS codegen file path |
| `config` | `undefined` | Engine config object or path to config file |

## How It Works

The Rollup adapter is a thin `createRollupPlugin(unpluginFactory)` wrapper. It uses the same transform pipeline and codegen logic as all other unplugin adapters. The plugin:

1. Scans source files for `pika()` calls during the build.
2. Replaces each call with the generated atomic class name string.
3. Writes atomic CSS rules to the codegen output file.
4. Resolves `pika.css` imports to the generated CSS file.

## Next

- [Rolldown](/integrations/rolldown)
- [Plugin Options Reference](/guide/configuration)
