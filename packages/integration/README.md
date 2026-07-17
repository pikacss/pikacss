# @pikacss/integration

Integration layer between the PikaCSS core engine and bundler plugins. Handles config loading, file scanning, source transformation, and code generation.

## Installation

```bash
pnpm add @pikacss/integration
```

## Usage

```ts
import { createCtx } from '@pikacss/integration'

const ctx = createCtx({
  cwd: process.cwd(),
  currentPackageName: '@pikacss/unplugin-pikacss',
  scan: {
    include: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}'],
    exclude: ['node_modules/**', 'dist/**'],
  },
  configOrPath: undefined,
  fnName: 'pika',
  transformedFormat: 'string',
  tsCodegen: 'pika.gen.ts',
  cssCodegen: 'pika.gen.css',
  autoCreateConfig: false,
})
```

## Documentation

See the [full documentation](https://pikacss.github.io/api/integration).

## License

MIT
