---
title: 'FAQ'
description: 'Frequently asked questions and troubleshooting tips for PikaCSS.'
category: troubleshooting
order: 10
---

# FAQ

Common questions and solutions for PikaCSS.

## Why are my styles not appearing?

Make sure the generated CSS file (`pika.gen.css`) is imported in your application entry point:

```ts
// main.ts
import 'pika.css'
```

If you are using the unplugin or Nuxt integration, the import is injected automatically — verify that the plugin is registered in your build config.

## Why do I get "no-dynamic-args" ESLint errors?

The `pikacss/no-dynamic-args` rule requires that every argument passed to `pika()` is a static literal. Extract the dynamic part into separate `pika()` calls and combine the resulting class names at the call site:

```ts
// ❌ Invalid — conditional argument
pika(isDark ? { color: 'white' } : { color: 'black' })

// ✅ Valid — separate calls, combine at call site
const className = isDark
  ? pika({ color: 'white' })
  : pika({ color: 'black' })
```

## How do I change the layer order?

Define a custom `layers` map in your engine config. Lower numbers render earlier:

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  layers: {
    reset: -1,
    preflights: 1,
    components: 5,
    utilities: 10,
  },
})
```

See [Layers](/customizations/layers) for a full example.

## Can I use PikaCSS without a build plugin?

Yes. `@pikacss/core` works at runtime without a bundler plugin. Call `engine.use()` to register atomic classes and `engine.renderCSS()` to get the CSS output:

```ts
import { createEngine } from '@pikacss/core'

const engine = await createEngine({ /* config */ })
engine.use({ color: 'red' })
const css = engine.renderCSS()
```

The unplugin integration adds HMR, auto-import injection, and static extraction but is not required.

## How do I add a custom pseudo-class or breakpoint?

Use the `selectors` config property to register custom selectors, including pseudo-classes and media-query responsive breakpoints:

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  selectors: {
    selectors: [
      ['@dark', 'html.dark $'],
      ['@sm', '@media (min-width: 640px)'],
    ],
  },
})
```

See [Selectors](/customizations/selectors).

## TypeScript cannot find module augmentations from a plugin

Ensure the plugin package is installed and that your `tsconfig.json` uses `moduleResolution: 'bundler'` or `'node16'`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

Each official plugin ships module-augmented types that extend `EngineConfig` in `@pikacss/core`.

## Styles are not updating during development (HMR)

The PikaCSS Vite plugin handles HMR automatically. If styles are not updating:

1. Verify the plugin is registered in `vite.config.ts` with `PikaCSS()`.
2. Check that `import 'pika.css'` is present in your entry file.
3. Restart the dev server if you changed `pika.config.ts` — config changes require a server restart.

## How do I combine PikaCSS classes conditionally?

Since `pika()` returns a plain class name string, use standard JavaScript to combine them:

```ts
const base = pika({ display: 'flex', padding: '1rem' })
const active = pika({ color: 'blue' })
const inactive = pika({ color: 'gray' })

const className = `${base} ${isActive ? active : inactive}`
```

## Next

- [Getting Started](/getting-started/what-is-pikacss) — start from the beginning.
- [API Reference](/api/) — full API details.
