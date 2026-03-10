# Nuxt

Nuxt has its own PikaCSS module path, but the same core rules still apply: import the generated CSS entry, keep style input static, and move reusable patterns into config.

## Install

::: code-group
<<< @/.examples/integrations/install-nuxt.sh [pnpm]
<<< @/.examples/integrations/install-nuxt-npm.sh [npm]
<<< @/.examples/integrations/install-nuxt-yarn.sh [yarn]
:::

## Minimal setup

<<< @/.examples/integrations/nuxt.config.ts

## When to customize scanning

If your project has non-standard source locations, customize scanning deliberately instead of assuming Nuxt module defaults will discover everything.

<<< @/.examples/integrations/nuxt.config.scan-all.ts

## What usually goes wrong

- missing CSS entry import
- styles authored outside scanned files
- runtime expressions inside `pika()`
- assuming zero-config should cover all team-wide conventions

## Next

- [Static Arguments](/getting-started/static-arguments)
- [Integrations Overview](/integrations/overview)
- [Generated Files](/guide/generated-files)
- [Common Problems](/troubleshooting/common-problems)
