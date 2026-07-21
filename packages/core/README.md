# @pikacss/core

Zero-runtime atomic CSS-in-JS engine core. Transforms TypeScript style definitions into optimized atomic CSS at build time.

## Installation

```bash
pnpm add @pikacss/core
```

## Usage

```ts
import { createEngine } from '@pikacss/core'

const engine = await createEngine({
  prefix: 'pk-',
})

const ids = await engine.use({ display: 'flex', color: 'red' })
const css = await engine.renderAtomicStyles(true, { atomicStyleIds: ids })
```

## Documentation

See the [full documentation](https://pikacss.github.io/api/core).

## Diagnostics

`@pikacss/core` is platform-neutral and performs no console I/O by default. Explicitly install an instance-scoped handler when diagnostics should be surfaced:

```ts
const engine = await createEngine(config, {
  onDiagnostic(diagnostic) {
    // Route to your host logger, editor UI, telemetry, or test assertions.
  },
})
```

Plugin lifecycle failures are reported and rethrown; warnings are delivered only through the configured handler. Diagnostics and optional tracing are separate host-controlled channels, so configuring both does not duplicate the same runtime event.

## Optional tracing

The exported `log` and `createLogger()` APIs independently default to no-op output handlers. A host explicitly controls which debug, info, warning, and error sinks tracing uses.

## License

MIT
