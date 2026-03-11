# Fonts

`@pikacss/plugin-fonts` brings hosted fonts, local `@font-face` definitions, and semantic font tokens into the same build-time workflow as the rest of your PikaCSS configuration.

## When to use it

Use the fonts plugin when you want:

- provider-driven web font imports without hand-writing URLs
- semantic tokens such as `sans`, `mono`, and `display` that become reusable utilities
- a single config surface for hosted fonts and local `@font-face` families
- room for provider-specific options and custom provider definitions

## Install

::: code-group
<<< @/.examples/plugins/fonts-install.sh [pnpm]
<<< @/.examples/plugins/fonts-install-npm.sh [npm]
<<< @/.examples/plugins/fonts-install-yarn.sh [yarn]
:::

## Minimal setup

<<< @/.examples/plugins/fonts-basic-config.ts

Each token creates both a `font-{token}` shortcut and a matching `--pk-font-{token}` CSS variable.

## Provider-specific options

Google Fonts is the default provider, and Bunny, Fontshare, and Coollabs are built in as well.

When a provider needs its own query parameters, pass them through `providerOptions` instead of hard-coding URL logic into your config.

<<< @/.examples/plugins/fonts-provider-options.ts

## Custom providers

The v2 provider interface lets you register your own import builder while still reusing the same token model and generated utilities.

<<< @/.examples/plugins/fonts-custom-provider.ts

## Manual `@font-face` and local files

If the font files already live in your project or CDN, define `faces` and map them into semantic families.

<<< @/.examples/plugins/fonts-font-face.ts

## Next

- [Typography](/plugins/typography)
- [Configuration](/guide/configuration)
- [Theming And Variables](/patterns/theming-and-variables)
- [Create A Plugin](/plugin-system/create-plugin)
