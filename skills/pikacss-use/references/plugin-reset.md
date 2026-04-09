# Plugin: Reset

> Read this when the user asks about CSS reset styles, normalized base styles, or the reset plugin configuration.

## Installation

```bash
pnpm add -D @pikacss/plugin-reset
```

## Setup

```ts
// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
  plugins: [reset()],
})
```

`reset()` takes no arguments. Configure the plugin via the top-level `reset` key on `EngineConfig` (added by module augmentation); if that key is unset, the plugin uses `'modern-normalize'`.

## Choosing a Reset Style

Set the `reset` config key to one of:

| Value | Description |
|---|---|
| `'modern-normalize'` | modern-normalize CSS **(default)** |
| `'normalize'` | normalize.css |
| `'eric-meyer'` | Eric Meyer's classic reset |
| `'andy-bell'` | Andy Bell's modern reset |
| `'the-new-css-reset'` | The New CSS Reset |

```ts
export default defineEngineConfig({
  reset: 'andy-bell',
  plugins: [reset()],
})
```

## Behavior

- `reset()` does not accept inline options; the `reset` config key is the only way to choose a stylesheet.
- If `reset` is unset, the plugin emits the `modern-normalize` stylesheet by default.
- Emits the chosen reset as a preflight on a dedicated `reset` layer with order/priority `-1`, so it renders before all other layers.
- No runtime cost — CSS is injected statically at build time.
