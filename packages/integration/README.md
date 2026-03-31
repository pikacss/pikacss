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
})
```

## Documentation

See the [full documentation](https://pikacss.com/guide/integrations/).

## License

MIT
