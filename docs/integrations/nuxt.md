# Nuxt Integration

PikaCSS provides a dedicated [Nuxt](https://nuxt.com/) module via the `@pikacss/nuxt-pikacss` package.

## Install

::: code-group
<<< @/.examples/integrations/install-nuxt.sh [pnpm]
<<< @/.examples/integrations/install-nuxt-npm.sh [npm]
<<< @/.examples/integrations/install-nuxt-yarn.sh [yarn]
<<< @/.examples/integrations/install-nuxt-bun.sh [bun]
:::

## Configure Nuxt

Register the module in your `nuxt.config.ts`:

<<< @/.examples/integrations/nuxt.config.ts

That's it — no additional setup is required. The module handles everything automatically.

## Custom Options

You can configure PikaCSS options via the `pikacss` key in your Nuxt config:

<<< @/.examples/integrations/nuxt.config.with-options.ts

The `ModuleOptions` type is the same as `PluginOptions` from `@pikacss/unplugin-pikacss`, except the `currentPackageName` field is omitted (it is set internally to `'@pikacss/nuxt-pikacss'`).

## What the Module Sets Up

The Nuxt module handles the following automatically:

1. **Registers a Nuxt plugin** that imports `pika.css` — you do **not** need to manually import the generated CSS.
2. **Adds the Vite plugin** (`@pikacss/unplugin-pikacss/vite`) with `enforce: 'pre'` for correct transform ordering.
3. **Forwards options** from `nuxt.options.pikacss` to the underlying Vite plugin.
4. **Default scan patterns**: When you omit the `pikacss` key, the module uses the same default as unplugin: `**/*.{js,ts,jsx,tsx,vue}`. To narrow scanning, pass `pikacss.scan.include` explicitly.

::: tip Narrow the scan only when you need it
The Nuxt module starts with the standard unplugin scan pattern. If you want to keep scanning limited to component files, pass an explicit `scan.include` option such as:

<<< @/.examples/integrations/nuxt.config.scan-all.ts
:::

::: tip No CSS import needed
Unlike other integrations, you do **not** need to add `import 'pika.css'` to your entry file. The Nuxt module creates a plugin template that imports it for you automatically.
:::

## Plugin Options

See the [Rollup Integration](/integrations/rollup#plugin-options) page for the full options table — the module accepts the same options (except `currentPackageName`) via the `pikacss` config key.

## Next

- [Webpack](/integrations/webpack)
- [Integrations Overview](/integrations/overview)
- [Custom Integration](/integrations/custom-integration)
