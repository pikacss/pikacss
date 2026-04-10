# @pikacss/core

Zero-runtime atomic CSS-in-JS engine core. Transforms TypeScript style definitions into optimized atomic CSS at build time.

## Installation

```bash
pnpm add @pikacss/core
```

## Usage

```ts
import { createEngine, defineEngineConfig } from '@pikacss/core'

const engine = await createEngine({
  prefix: 'pk-',
})

const ids = await engine.use({ display: 'flex', color: 'red' })
const css = engine.renderAtomicStyles(true, { atomicStyleIds: ids })
```

## Documentation

See the [full documentation](https://pikacss.com/api/core).

## License

MIT
