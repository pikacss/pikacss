# @pikacss/plugin-reset

CSS reset plugin for PikaCSS. Injects popular CSS reset stylesheets as preflight styles.

## Installation

```bash
pnpm add -D @pikacss/plugin-reset
```

## Usage

```ts
import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
  plugins: [reset()],
  reset: 'modern-normalize', // default
})
```

## Documentation

See the [full documentation](https://pikacss.com/guide/plugins/reset).

## License

MIT
