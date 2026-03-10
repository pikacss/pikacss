# Zero Config

Zero-config is the fastest path to a first successful build. It is not the best long-term shape for most applications.

When no config file exists and auto-create is enabled, the integration can scaffold one for you:

<<< @/.examples/getting-started/auto-created-config.js

## When zero-config is enough

Zero-config works well when you are still validating the engine and you only need:

- Plain literal style objects.
- No shared selectors or shortcuts.
- No custom variables.
- No external plugins.

## When to stop relying on it

Add a real config file as soon as any of these appear:

- Repeated responsive or theme selectors.
- Shared component recipes that belong in shortcuts.
- Design tokens through CSS variables.
- Official plugins such as icons, reset, or typography.
- Team-level conventions for layers, prefixes, or preflights.

<<< @/.examples/getting-started/custom-config.ts

## The practical rule

Use zero-config to prove the pipeline. Use a config file to build a system.

::: warning Common mistake
Do not interpret zero-config as a recommendation to avoid configuration forever. That usually leads to duplicated selectors, inconsistent shortcuts, and hard-to-review style conventions.
:::

## Next

- [Configuration](/guide/configuration)
- [Generated Files](/guide/generated-files)
- [Theming And Variables](/patterns/theming-and-variables)
- [Plugins: Reset](/plugins/reset)
