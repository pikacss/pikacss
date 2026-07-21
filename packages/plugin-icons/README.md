# @pikacss/plugin-icons

Iconify icons plugin for PikaCSS. Renders icons from Iconify collections as CSS mask-image or background-image.

## Installation

```bash
pnpm add -D @pikacss/plugin-icons
```

## Usage

```ts
import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons/node'

export default defineEngineConfig({
  plugins: [icons()],
  icons: {
    autoInstall: true,
  },
})
```

The package root is platform-neutral and supports custom collections and CDN loading. Locally installed or auto-installed `@iconify-json/*` collections use the `/node` adapter shown above.

Then use in templates:

```vue
<div :class="pika('i-mdi:home')" />
```

## Documentation

See the [full documentation](https://pikacss.github.io/official-plugins/icons).

## License

MIT
