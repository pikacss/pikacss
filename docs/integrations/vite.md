# Vite

Vite is the easiest way to understand the PikaCSS integration model, even if your final target is another unplugin-compatible bundler.

## Install

::: code-group
<<< @/.examples/integrations/vite-install.sh [pnpm]
<<< @/.examples/integrations/vite-install-npm.sh [npm]
<<< @/.examples/integrations/vite-install-yarn.sh [yarn]
:::

## Minimal setup

<<< @/.examples/integrations/vite-basic-config.ts

<<< @/.examples/integrations/import-pika-css.ts

## Inline config vs config file

Use an inline config only for very small setups or experiments.

<<< @/.examples/integrations/vite-inline-config.ts

For most applications, prefer a dedicated `pika.config.ts` file so selectors, shortcuts, variables, and plugins have one stable home.

## Useful options

<<< @/.examples/integrations/vite-all-options.ts

## What to verify first

1. `pika.css` is imported in your app entry.
2. The plugin is registered in `vite.config.ts`.
3. Your `pika()` input is static.
4. Generated files appear where you expect them.

## Next

- [First Pika](/getting-started/first-pika)
- [Static Arguments](/getting-started/static-arguments)
- [Generated Files](/guide/generated-files)
- [ESLint](/integrations/eslint)
