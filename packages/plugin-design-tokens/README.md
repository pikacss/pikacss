# @pikacss/plugin-design-tokens

Design tokens plugin for PikaCSS. Converts W3C Design Tokens (JSON files, inline objects, or `design.md` documents) into CSS variables through the engine's `variables` system.

## Installation

```bash
pnpm add -D @pikacss/plugin-design-tokens
```

## Usage

```ts
import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'

export default defineEngineConfig({
  plugins: [designTokens()],
  designTokens: {
    sources: ['./design.md'],
    themes: {
      dark: { selector: '.dark' },
    },
  },
})
```

## Documentation

See the [full documentation](https://pikacss.github.io/official-plugins/design-tokens).

## License

MIT
