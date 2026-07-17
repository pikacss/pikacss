# Build Plugin Options

> Read this when the user asks about customizing the build plugin behavior — scan patterns, output format, generated file paths, or function name.

If the project is Nuxt, prefer `@pikacss/nuxt-pikacss` instead of manually wiring `@pikacss/unplugin-pikacss/vite`. The Nuxt module configures the Vite plugin for you and injects a generated Nuxt plugin/template that imports `pika.css`, so manual CSS imports are not needed there.

## Unplugin Options

The `pikacss()` factory function from each bundler subpath export accepts an options object:

```ts
import pikacss from '@pikacss/unplugin-pikacss/vite'

export default defineConfig({
  plugins: [
    pikacss({
      // All options below are optional — defaults work for most projects
      fnName: 'pika',
      transformedFormat: 'string',
      scan: {
        include: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}'],
        exclude: ['node_modules/**', 'dist/**', '.git/**', '.nuxt/**', '.output/**', 'coverage/**'],
      },
    }),
  ],
})
```

## Option Reference

The default generated filenames (`pika.gen.ts` and `pika.gen.css`) are convenience defaults, not required names. When you pass a string to `tsCodegen` or `cssCodegen`, that exact custom path is used.

| Option | Type | Default | Purpose |
|---|---|---|---|
| `fnName` | `string` | `'pika'` | Base function name recognized by the transform |
| `transformedFormat` | `'string' \| 'array'` | `'string'` | Output format of `pika()` calls |
| `scan.include` | `string[]` | `['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}']` | Glob patterns for files to scan |
| `scan.exclude` | `string[]` | `['node_modules/**', 'dist/**', '.git/**', '.nuxt/**', '.output/**', 'coverage/**']` | Glob patterns to exclude |
| `config` | `EngineConfig \| string` | auto-discovery | Engine config object or path to config file |
| `autoCreateConfig` | `boolean` | `false` | Opt in to scaffolding a default config file when none is found |
| `tsCodegen` | `boolean \| string` | `true` (`pika.gen.ts`) | TypeScript declaration output path when set to a string; `false` disables codegen |
| `cssCodegen` | `true \| string` | `true` (`pika.gen.css`) | CSS output file path when set to a string; cannot be disabled |

## Common Scenarios

### Change output format to array

```ts
pikacss({ transformedFormat: 'array' })
// pika({ display: 'flex' }) → ['pk-a1b2'] instead of 'pk-a1b2'
```

### Custom output paths

These filenames are examples only. Any custom path that fits the project layout is valid; the important part is setting `tsCodegen` and `cssCodegen` to the paths you want generated.

```ts
pikacss({
  tsCodegen: 'src/generated/pika.d.ts',
  cssCodegen: 'src/generated/pika.css',
})
```

### Customize the scan globs

JS-family sources (`js`, `mjs`, `cjs`, `jsx`, `ts`, `mts`, `cts`, `tsx`) and Vue SFCs (`vue`) are supported by the AST-based transform. The default `scan.include` already covers every supported extension; override it to narrow the scan to specific directories:

```ts
pikacss({
  scan: { include: ['src/**/*.{ts,tsx,vue}', 'shared/**/*.mts'] },
})
```

Setting `scan.include` explicitly replaces the default glob entirely. Other markup formats (Svelte, Astro, plain HTML) are not processed.

### Disable TypeScript generation

```ts
pikacss({ tsCodegen: false })
```

### Custom function name

```ts
pikacss({ fnName: 'css' })
// Now use css({ display: 'flex' }) instead of pika(...)
```

## HMR / Dev Server

The plugin automatically handles:
- Hot module replacement for CSS changes during development
- Config file watching — changes to `pika.config.ts` trigger full engine reinit
- Source file watching — `pika()` call changes trigger targeted transforms
- Debounced codegen writes (300ms) to prevent thrashing

No consumer configuration is needed for HMR.
