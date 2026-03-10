# ESLint

The ESLint integration exists to catch invalid `pika()` inputs before they become build confusion.

## Install

::: code-group
<<< @/.examples/integrations/eslint-install.sh [pnpm]
<<< @/.examples/integrations/eslint-install-npm.sh [npm]
<<< @/.examples/integrations/eslint-install-yarn.sh [yarn]
:::

## Recommended config

<<< @/.examples/integrations/eslint-recommended-config.mjs

## What valid usage looks like

<<< @/.examples/integrations/eslint-valid-example.ts

## What invalid usage looks like

<<< @/.examples/integrations/eslint-invalid-example.ts

## Why this is worth enforcing

Without linting, teams often discover the static boundary too late, after style output looks missing or unexpected. With linting, the editor and CI enforce the correct authoring model continuously.

::: tip Team recommendation
Adopt the ESLint rule before PikaCSS usage spreads beyond one or two files. It is much cheaper than cleaning up invalid patterns after they become habits.
:::

## Next

- [Static Arguments](/getting-started/static-arguments)
- [Common Problems](/troubleshooting/common-problems)
- [Configuration](/guide/configuration)
- [Plugin System Overview](/plugin-system/overview)
