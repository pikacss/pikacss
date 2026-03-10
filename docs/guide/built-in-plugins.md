# Built-in Plugins

PikaCSS ships with built-in engine capabilities that are always available. They are configured through top-level engine config keys, not through the external `plugins` array.

## The built-in set

| Built-in plugin | Use it for |
| --- | --- |
| important | global and per-definition `!important` behavior |
| variables | CSS custom properties, token scoping, autocomplete |
| keyframes | animation registration and autocomplete |
| selectors | pseudo states, media aliases, custom selector expansion |
| shortcuts | reusable style recipes and dynamic shortcut patterns |

<<< @/.examples/guide/built-in-plugins-config.ts

## Why this matters

Many first-time plugin users assume every extension point belongs inside `plugins`. That is only true for external plugins such as icons, reset, and typography.

Built-in plugin config exists because these behaviors are foundational parts of the engine itself.

## Where to go deeper

- selectors are covered in [Responsive And Selectors](/patterns/responsive-and-selectors)
- variables are covered in [Theming And Variables](/patterns/theming-and-variables)
- engine-level setup is covered in [Configuration](/guide/configuration)
- extension APIs are covered in [Plugin System Overview](/plugin-system/overview)

## Next

- [Configuration](/guide/configuration)
- [Responsive And Selectors](/patterns/responsive-and-selectors)
- [Theming And Variables](/patterns/theming-and-variables)
- [Plugin System Overview](/plugin-system/overview)
