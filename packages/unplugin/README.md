# @pikacss/unplugin-pikacss

Universal bundler plugin for PikaCSS. Supports Vite, Webpack, Rspack, Rollup, Rolldown, esbuild, and Farm.

## Installation

```bash
pnpm add -D @pikacss/unplugin-pikacss
```

## Usage

### Vite

```ts
// vite.config.ts
import pikacss from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [pikacss()],
})
```

### Other bundlers

```ts
import pikacss from '@pikacss/unplugin-pikacss/rollup'
import pikacss from '@pikacss/unplugin-pikacss/rspack'
import pikacss from '@pikacss/unplugin-pikacss/webpack'
```

## Documentation

See the [full documentation](https://pikacss.com/guide/integrations/vite).

## License

MIT
