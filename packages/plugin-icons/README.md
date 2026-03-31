# @pikacss/plugin-icons

Iconify icons plugin for PikaCSS. Renders icons from Iconify collections as CSS mask-image or background-image.

## Installation

```bash
pnpm add -D @pikacss/plugin-icons
```

## Usage

```ts
import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  plugins: [icons()],
  icons: {
    autoInstall: true,
  },
})
```

Then use in templates:

```vue
<div :class="pika('i-mdi:home')" />
```

## Documentation

See the [full documentation](https://pikacss.com/guide/plugins/icons).

## License

MIT
