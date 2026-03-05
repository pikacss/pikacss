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
4. **Default scan patterns**: When no `pikacss` options are provided, it scans `**/*.vue`, `**/*.tsx`, and `**/*.jsx` files by default.

::: warning Nuxt default scan excludes `.ts` and `.js` files
The Nuxt module's built-in default intentionally omits plain `.ts` and `.js` files. In Nuxt, it is recommended to keep `pika()` calls inside component files (`.vue`, `.tsx`, `.jsx`) rather than in composables or utility modules, because server-side rendering and Nuxt's module resolution can cause those files to be evaluated in environments where the build transform may not run.

If you do use `pika()` inside `.ts` composables, pass an explicit `scan.include` option to restore the broader pattern:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  pikacss: {
    scan: {
      include: ['**/*.{js,ts,jsx,tsx,vue}'],
    },
  },
})
```
:::

::: tip No CSS import needed
Unlike other integrations, you do **not** need to add `import 'pika.css'` to your entry file. The Nuxt module creates a plugin template that imports it for you automatically.
:::

## Plugin Options

See the [Rollup Integration](/integrations/rollup#plugin-options) page for the full options table — the module accepts the same options (except `currentPackageName`) via the `pikacss` config key.

## Next

- [Webpack](/integrations/webpack)
