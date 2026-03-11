# Create A Plugin

The easiest way to write a good PikaCSS plugin is to start with one narrow responsibility.

Good first plugins usually do one of these:

- register selectors
- register shortcuts
- register variables
- add preflights
- augment autocomplete

## Minimal plugin factory

<<< @/.examples/plugin-system/minimal-plugin.ts

If you need options, export a factory function instead of a singleton plugin object.

<<< @/.examples/plugin-system/plugin-with-options.ts

## The most useful hook for first plugins

Most first plugins should start in `configureEngine`.

<<< @/.examples/plugin-system/hook-configure-engine.ts

That hook gives you access to the public engine APIs for selectors, shortcuts, variables, keyframes, preflights, and autocomplete.

Use `engine.appendAutocomplete()` as the single autocomplete mutation API. Add selectors, style item strings, extra properties, CSS property values, and template-literal patterns through one payload instead of calling separate per-bucket helpers.

<<< @/.examples/plugin-system/autocomplete-api.ts

## When to use other hooks

- use `configureRawConfig` to add or adjust config before resolution
- use `configureResolvedConfig` to react to resolved defaults
- use transform hooks only when engine APIs are not enough

<<< @/.examples/plugin-system/hook-configure-raw-config.ts

<<< @/.examples/plugin-system/hook-configure-resolved-config.ts

## Add types for end users

Official plugins feel first-class because they augment `EngineConfig` and autocomplete types.

<<< @/.examples/plugin-system/module-augmentation.ts

<<< @/.examples/plugin-system/use-plugin-in-config.ts

## Preflights are powerful and global

Use preflights for resets, defaults, or shared global rules. Keep them scoped and intentional because they affect the whole CSS output.

<<< @/.examples/plugin-system/preflight-definition.ts

<<< @/.examples/plugin-system/preflight-with-layer.ts

<<< @/.examples/plugin-system/preflight-with-id.ts

## Reference implementations

- reset shows config manipulation plus preflights
- typography shows tokens plus content-oriented shortcuts
- icons shows a more advanced integration pattern

## Next

- [Hook Execution](/plugin-system/hook-execution)
- [Icons](/plugins/icons)
- [Reset](/plugins/reset)
- [Typography](/plugins/typography)
