# Reset

`@pikacss/plugin-reset` gives you a build-time way to establish a CSS reset baseline without leaving the PikaCSS configuration model.

## When to use it

Use the reset plugin when you want one shared baseline for element defaults across a project or design system.

## Install

::: code-group
<<< @/.examples/plugins/reset-install.sh [pnpm]
<<< @/.examples/plugins/reset-install-npm.sh [npm]
<<< @/.examples/plugins/reset-install-yarn.sh [yarn]
:::

## Minimal setup

<<< @/.examples/plugins/reset-basic-usage.ts

## Available presets

<<< @/.examples/plugins/reset-all-presets.ts

## When a reset helps and when it hurts

Resets are useful when you want to standardize browser defaults early. They are less useful when a project already has a strong, intentional baseline and the reset only creates another layer of surprises.

::: warning Do not hide project styling problems behind a reset
A reset should normalize defaults. It should not become the place where unrelated typography, spacing, and component decisions accumulate.
:::

## Custom preset example

<<< @/.examples/plugins/reset-custom-preset.ts

## Next

- [Typography](/plugins/typography)
- [Configuration](/guide/configuration)
- [Create A Plugin](/plugin-system/create-plugin)
- [Common Problems](/troubleshooting/common-problems)
