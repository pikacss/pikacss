# Typography

`@pikacss/plugin-typography` is for content-heavy surfaces where you want prose defaults, readable rhythm, and token-driven customization without hand-styling every article block.

## When to use it

Use the typography plugin for:

- docs sites
- blog content
- CMS-rendered article bodies
- markdown containers that need coherent prose defaults

## Install

::: code-group
<<< @/.examples/plugins/typography-install.sh [pnpm]
<<< @/.examples/plugins/typography-install-npm.sh [npm]
<<< @/.examples/plugins/typography-install-yarn.sh [yarn]
:::

## Minimal setup

<<< @/.examples/plugins/typography-basic-config.ts

## Usage

<<< @/.examples/plugins/typography-usage-prose.ts

## Customize variables, not every element by hand

<<< @/.examples/plugins/typography-custom-variables.ts

This plugin is most valuable when you treat prose as a content system with adjustable tokens, not a long list of manual tag overrides.

## Next

- [Theming And Variables](/patterns/theming-and-variables)
- [Plugin System Overview](/plugin-system/overview)
- [Configuration](/guide/configuration)
- [FAQ](/community/faq)
