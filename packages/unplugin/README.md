# @pikacss/unplugin-pikacss

Universal bundler plugin for PikaCSS. Supports Vite, Webpack, Rspack, Rollup, Rolldown, and esbuild.

PikaCSS requires Node.js 22 or later (package engine range: `>=22`). The Vite entry supports Vite 7 and 8 only.

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

Use the entry point matching your bundler:

| Bundler | Entry point |
|---|---|
| Rollup | `@pikacss/unplugin-pikacss/rollup` |
| Rolldown | `@pikacss/unplugin-pikacss/rolldown` |
| Webpack | `@pikacss/unplugin-pikacss/webpack` |
| Rspack | `@pikacss/unplugin-pikacss/rspack` |
| esbuild | `@pikacss/unplugin-pikacss/esbuild` |

For example:

```ts
// rollup.config.ts
import pikacss from '@pikacss/unplugin-pikacss/rollup'

export default {
  plugins: [pikacss()],
}
```

See the integration guide for bundler-specific configuration details.

## Documentation

See the [full documentation](https://pikacss.github.io/integrations/unplugin).

## License

MIT
