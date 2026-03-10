# Hook Execution

If you only remember one thing about plugin hooks, remember this: choose the latest hook that still gives you the control you need.

That keeps plugins easier to reason about and reduces accidental interference with other plugins.

## Hook decision table

| Need | Hook |
| --- | --- |
| modify user config before defaults are applied | `configureRawConfig` |
| inspect or alter resolved defaults | `configureResolvedConfig` |
| call engine APIs and register behavior | `configureEngine` |
| rewrite style items before extraction | `transformStyleItems` |
| rewrite selector chains | `transformSelectors` |
| rewrite nested style definitions | `transformStyleDefinitions` |
| observe engine events only | sync notification hooks |

## Payload chaining

Async hooks can return a new payload. That new payload is passed to the next plugin in order.

<<< @/.examples/plugin-system/overview-async-hook.ts

The practical consequence is simple: plugins that return transformed payloads should be explicit and conservative, because later plugins will see that modified result.

## Error isolation

Hook errors are caught and logged so one broken plugin does not break the full chain by default. That is good for resilience, but it also means silent plugin failure can look like missing behavior if you do not inspect logs.

## Notification hooks are for observation

Notification hooks exist so integrations or plugins can react to changes such as preflight updates, atomic style generation, or autocomplete updates.

<<< @/.examples/plugin-system/hook-notifications.ts

## A practical rule for plugin authors

Start with `configureEngine`. Only move earlier or deeper into transforms when a concrete limitation forces you there.

## Next

- [Create A Plugin](/plugin-system/create-plugin)
- [Built-in Plugins](/guide/built-in-plugins)
- [FAQ](/community/faq)
