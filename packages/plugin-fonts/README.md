# @pikacss/plugin-fonts

Web fonts plugin for PikaCSS. Loads fonts from providers (Google, Bunny, etc.) and creates CSS variables and shortcuts.

## Installation

```bash
pnpm add -D @pikacss/plugin-fonts
```

## Usage

```ts
import { defineEngineConfig } from '@pikacss/core'
import { fonts } from '@pikacss/plugin-fonts'

export default defineEngineConfig({
  plugins: [fonts()],
  fonts: {
    provider: 'google',
    fonts: {
      sans: 'Inter:400,500,600,700',
    },
  },
})
```

## Documentation

See the [full documentation](https://pikacss.com/guide/plugins/fonts).

## License

MIT
