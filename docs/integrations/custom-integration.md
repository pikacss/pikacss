# Custom Build Tool Integration

PikaCSS ships official adapters for mainstream build tools through `@pikacss/unplugin-pikacss`. When you need to support a compiler, bundler, or pipeline that does not fit the unplugin model, build directly on top of `createCtx()` from `@pikacss/integration`.

`createCtx()` is the shared integration primitive behind the official adapters. It handles config loading, engine setup, source transforms, virtual CSS output, and generated files. Your adapter only needs to connect those capabilities to your build tool lifecycle.

## Installation

::: code-group
<<< @/.examples/integrations/install-integration.sh [pnpm]
<<< @/.examples/integrations/install-integration-npm.sh [npm]
<<< @/.examples/integrations/install-integration-yarn.sh [yarn]
<<< @/.examples/integrations/install-integration-bun.sh [bun]
:::

## When to Use `createCtx()`

Use `createCtx()` when you need to:

- Support a build tool that has no official PikaCSS adapter yet
- Control plugin lifecycle details that are outside unplugin's abstraction
- Reuse PikaCSS's transform and codegen pipeline in a custom integration layer

If your build tool is already supported by `@pikacss/unplugin-pikacss`, prefer the official adapter instead.

## Function Signature

<<< @/.examples/integrations/create-ctx-signature.ts

`createCtx()` accepts `IntegrationContextOptions` and returns an `IntegrationContext` instance.

### `IntegrationContextOptions`

Pass every option explicitly when you create the context. Official adapters choose their own defaults, but a custom integration should make each path and lifecycle decision obvious up front.

<<< @/.examples/integrations/create-ctx-options.ts

| Property | Type | Typical value | Purpose |
|---|---|---|---|
| `cwd` | `string` | `process.cwd()` | Working directory used to resolve config files, scan patterns, and generated file paths. Point this at the project root your adapter is currently building. |
| `currentPackageName` | `string` | `'my-build-tool-pikacss'` | Package name written into generated file headers, log messages, and auto-created config imports. Set this to your integration package name so generated artifacts and errors identify the correct adapter. |
| `scan.include` | `string[]` | `['src/**/*.{js,ts,jsx,tsx,vue}']` | Glob patterns scanned by `fullyCssCodegen()`. Include every source location where your build tool allows `pika()` calls. |
| `scan.exclude` | `string[]` | `['node_modules/**', 'dist/**']` | Glob patterns skipped during scanning. Exclude vendor code, build outputs, and any paths your adapter should never transform. |
| `configOrPath` | `EngineConfig \| string \| null \| undefined` | `undefined` | Inline engine config object, explicit config file path, or `null`/`undefined` for auto-detection. Use a path when your tool already knows the config location, or an object when the integration owns config assembly. |
| `fnName` | `string` | `'pika'` | Function name that `transform()` should detect in source modules. Keep `pika` unless your integration intentionally exposes a renamed global helper. |
| `transformedFormat` | `'string' \| 'array'` | `'string'` | Output shape written back into transformed modules. Use `'string'` for className-style consumers and `'array'` when your pipeline expects an array of generated class tokens. |
| `tsCodegen` | `false \| string` | `'pika.gen.ts'` | Enables and locates the generated TypeScript autocomplete file. Set `false` when your integration does not need generated declarations. |
| `cssCodegen` | `string` | `'pika.gen.css'` | Output path for the generated CSS file that backs the virtual `pika.css` module and any emitted build asset. |
| `autoCreateConfig` | `boolean` | `true` | Controls whether `loadConfig()` creates a starter config file when none is found. Disable it when your integration should fail instead of writing project files automatically. |

::: info
Relative `configOrPath`, `cssCodegen`, and `tsCodegen` paths are resolved from `cwd`. Pick a stable working directory before you call `createCtx()` so watch mode and generated files stay predictable.
:::

## Return Value: `IntegrationContext`

The returned `IntegrationContext` keeps the live engine state for your adapter and exposes everything you need to wire PikaCSS into another tool.

### Property Reference

| Property | Type | Purpose |
|---|---|---|
| `cwd` | `string` | Current working directory used to resolve config files, scan targets, and generated file paths. You can update it between runs if your adapter needs to retarget the context. |
| `currentPackageName` | `string` | Package name used in generated file headers and auto-created config files. |
| `fnName` | `string` | Function name pattern that `transform()` searches for in source modules. |
| `transformedFormat` | `'string' \| 'array'` | Default output shape for transformed `pika()` calls. |
| `cssCodegenFilepath` | `string` | Absolute path of the generated CSS file used by the virtual `pika.css` module. |
| `tsCodegenFilepath` | `string \| null` | Absolute path of the generated TypeScript file, if enabled. |
| `hasVue` | `boolean` | Whether `vue` can be resolved from the current working directory. Use this if your adapter needs Vue-specific handling. |
| `resolvedConfig` | `EngineConfig \| null` | Last loaded engine config object, including inline config or the parsed file result. |
| `resolvedConfigPath` | `string \| null` | Active config file path after loading. |
| `resolvedConfigContent` | `string \| null` | Last loaded config file content, useful for watch-mode reload checks. |
| `usages` | `Map<string, UsageRecord[]>` | Collected `pika()` usage records keyed by module id. Each record stores generated atomic style ids and the original `engine.use()` arguments. |
| `hooks` | `{ styleUpdated, tsCodegenUpdated }` | Event hooks triggered when CSS output or TypeScript autocomplete output needs to be regenerated. |
| `engine` | `Engine` | Active engine instance. Access this only after `setup()` has completed, because reading it too early throws. |
| `transformFilter` | `{ include: string[]; exclude: string[] }` | Scan patterns you can adapt to your build tool's own filtering system. The exclude list also contains generated CSS and TypeScript files so your adapter does not reprocess them. |
| `setupPromise` | `Promise<void> \| null` | Promise for an in-flight `setup()` call. Other async APIs await this automatically so repeated lifecycle calls stay serialized. |

### Method Reference

| Method | Signature | Purpose |
|---|---|---|
| `loadConfig()` | `() => Promise<{ config, file }>` | Resolve inline or file-based engine configuration, then update `resolvedConfig`, `resolvedConfigPath`, and `resolvedConfigContent`. |
| `transform(code, id)` | `(code: string, id: string) => Promise<{ code, map } \| null \| undefined>` | Transform one module by replacing `pika()` calls with generated class names and recording usage for later CSS or TypeScript code generation. |
| `getCssCodegenContent()` | `() => Promise<string \| null>` | Build the generated CSS content from the current usage map, including layer order, preflights, and atomic rules. |
| `getTsCodegenContent()` | `() => Promise<string \| null>` | Build the generated TypeScript autocomplete content. Returns `null` when `tsCodegen` is disabled. |
| `writeCssCodegenFile()` | `() => Promise<void>` | Ensure the CSS output directory exists, then write the latest generated CSS file to disk. |
| `writeTsCodegenFile()` | `() => Promise<void>` | Ensure the TypeScript output directory exists, then write the latest generated TypeScript file when codegen is enabled. |
| `fullyCssCodegen()` | `() => Promise<void>` | Scan every file matched by `scan.include`, run `transform()` for collection, and then write the generated CSS file. Use this in build mode or on an initial full scan. |
| `setup()` | `() => Promise<void>` | Reset the context, load config, recreate the engine, and install internal hooks that forward engine updates into `styleUpdated` and `tsCodegenUpdated`. |

::: tip
Call `await ctx.setup()` early in your adapter so config-loading and engine errors fail fast. The other async methods also wait for any in-flight setup, but explicit setup keeps lifecycle behavior easier to reason about.
:::

::: info
`setup()` clears existing usage records and reinitializes internal hook listeners. If your adapter subscribes to `ctx.hooks.styleUpdated` or `ctx.hooks.tsCodegenUpdated`, attach those listeners after `await ctx.setup()` or reattach them every time you rerun setup.
:::

## Minimal Custom Plugin

The following example shows a small custom build plugin that:

- creates a shared integration context
- binds update hooks after setup so listener registration survives context reinitialization
- runs a full scan in `buildStart()`
- forwards source transforms to `ctx.transform()`
- writes generated CSS and TypeScript files when usage changes
- resolves the virtual `pika.css` module to the generated CSS file

<<< @/.examples/integrations/custom-integration-plugin.ts

::: warning
`createCtx()` does not watch files or config changes for you. If your build tool supports watch mode or HMR, add your own reload logic around `ctx.resolvedConfigPath`, `ctx.resolvedConfigContent`, and repeated `ctx.setup()` calls.
:::

## How the Lifecycle Maps to Your Build Tool

Most custom integrations follow this pattern:

1. Create one context instance per build session.
2. Call `setup()` before the first transform or build scan.
3. Use `transform()` for each source module that should support `pika()`.
4. Use `fullyCssCodegen()` in build mode to collect usage across the whole project.
5. Expose `pika.css` by resolving it to `ctx.cssCodegenFilepath`.
6. Write CSS and TypeScript codegen files when your tool finishes a scan or receives update hooks.

This is the same architecture used by the official unplugin adapter, with the surrounding lifecycle handled by your own tooling.

## Implementation Reference

For the full production implementation, read the shared context source in [packages/integration/src/ctx.ts](https://github.com/pikacss/pikacss/blob/main/packages/integration/src/ctx.ts).

If you want to see how an official adapter wires `createCtx()` into real build hooks, compare it with [packages/unplugin/src/index.ts](https://github.com/pikacss/pikacss/blob/main/packages/unplugin/src/index.ts).

## Next

- [Integrations Overview](/integrations/overview)
- [Vite Integration](/integrations/vite)
- [Rollup Integration](/integrations/rollup)
- [Plugin System Overview](/plugin-system/overview)
