# Plugin System Overview

PikaCSS plugins are the public way to extend the engine. They let you adjust config, add selectors, variables, shortcuts, keyframes, preflights, autocomplete, and style transforms without forking core behavior.

## Who this section is for

This section is not part of the default user-adoption path. Read it when you want to:

- build your own plugin
- understand how official plugins work
- contribute to public extension points in core

## What an engine plugin is

Plugins are plain objects created with `defineEnginePlugin()`.

<<< @/.examples/plugin-system/overview-minimal-plugin.ts

The full interface has a `name`, optional `order`, and optional lifecycle hooks.

<<< @/.examples/plugin-system/overview-engine-plugin-interface.ts

## The plugin lifecycle in one sentence

Plugins can influence raw config, resolved config, engine setup, style-item transforms, selector transforms, style-definition transforms, and several notification points.

## How to think about hooks

- use `configureRawConfig` when you need to alter user config before resolution
- use `configureResolvedConfig` when you need defaults to be settled first
- use `configureEngine` when you want to call engine APIs such as `engine.selectors.add()`, `engine.addPreflight()`, or `engine.appendCssImport()`
- use transform hooks when you need to alter style processing itself
- use notification hooks when you only need to observe changes

## Ordering rules

Plugins run in `pre`, default, then `post` order.

<<< @/.examples/plugin-system/overview-plugin-order.ts

Built-in plugins run before user plugins, which means `order` only controls your position relative to other user plugins, not your position ahead of core internals.

## What plugin authors need to know early

1. Built-in plugin config and external plugins are different mechanisms.
2. Resolver-backed features such as selectors and shortcuts already expose engine APIs.
3. Preflights and layers are useful, but they affect global output and should be treated carefully.
4. Module augmentation changes the user-facing TypeScript experience and should stay intentional.

## Recommended learning path

1. Start with [Create A Plugin](/plugin-system/create-plugin).
2. Continue to [Hook Execution](/plugin-system/hook-execution).
3. Use official plugins as reference implementations.

## Next

- [Create A Plugin](/plugin-system/create-plugin)
- [Hook Execution](/plugin-system/hook-execution)
- [Built-in Plugins](/guide/built-in-plugins)
