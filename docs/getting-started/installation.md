# Installation

Most projects should start with the unplugin package. That path covers Vite, Rollup, Webpack, Rspack, Rolldown, and esbuild through a shared integration model.

::: code-group
<<< @/.examples/getting-started/install-unplugin.sh [pnpm]
<<< @/.examples/getting-started/install-unplugin-npm.sh [npm]
<<< @/.examples/getting-started/install-unplugin-yarn.sh [yarn]
:::

If you are using Nuxt, go straight to [Nuxt](/integrations/nuxt).

## Recommended first setup

Start with Vite unless your project already runs on something else. The smallest successful setup has three pieces:

1. Register the PikaCSS plugin in your bundler config.
2. Import the virtual module `pika.css` in your app entry.
3. Write a literal `pika()` call in a supported source file.

<<< @/.examples/integrations/vite-basic-config.ts

<<< @/.examples/integrations/import-pika-css.ts

## Supported build tools

- Vite
- Nuxt
- Rollup
- Webpack
- Rspack
- Rolldown
- esbuild

See [Integrations Overview](/integrations/overview) for the full matrix.

::: warning Read this before writing real styles
`pika()` arguments must be statically analyzable. Do not assume you can pass runtime values just because the API surface looks like normal JavaScript. Read [Static Arguments](/getting-started/static-arguments) before you spread usage across a codebase.
:::

## Config file discovery

PikaCSS automatically discovers config files named `pika.config.{js,ts,mjs,mts,cjs,cts}`. Zero-config is useful for the first run, but most real projects should add a config file as soon as they need selectors, shortcuts, variables, plugins, or consistent layer control.

<<< @/.examples/getting-started/pika.config.ts

## What gets generated

The integration may generate:

- `pika.gen.ts` for autocomplete and type augmentation.
- `pika.gen.css` as the generated CSS output file on disk.
- The virtual module `pika.css`, which resolves to generated CSS at build time.

Read [Generated Files](/guide/generated-files) before editing anything that looks auto-created.

## Next

- [First Pika](/getting-started/first-pika)
- [Static Arguments](/getting-started/static-arguments)
- [Zero Config](/getting-started/zero-config)
- [Vite](/integrations/vite)
