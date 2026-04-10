# @pikacss/unplugin-pikacss

Universal bundler plugin for PikaCSS. Supports Vite, Webpack, Rspack, Rollup, Rolldown, and esbuild.

The Vite entry supports Vite 7 and 8 only.

## Installation

```bash
pnpm add -D @pikacss/unplugin-pikacss
```

When using the `@pikacss/unplugin-pikacss/vite` entry, install Vite 7 or 8.

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

See the [full documentation](https://pikacss.com/integrations/unplugin).

## License

MIT
