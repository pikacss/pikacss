# FAQ

## What is Atomic CSS?

Atomic CSS is a strategy where each CSS class contains exactly **one** CSS property-value pair. When you write styles with PikaCSS, they are decomposed into these small atomic classes. Multiple elements that share the same property-value pair reuse the same class, leading to smaller CSS output as your project grows.

**Input:**

<<< @/.examples/community/faq-atomic-input.ts

**Generated CSS:**

<<< @/.examples/community/faq-atomic-output.css

## How are class names generated?

PikaCSS assigns each unique property-value-selector combination a short class name using a base-52 encoding (`a`–`z`, `A`–`Z`). By default, the engine prepends the `pk-` prefix, so the first atomic style becomes `pk-a`, the second `pk-b`, and so on. After 52 classes, names become `pk-aa`, `pk-ba`, etc. Set `prefix: ''` in your engine config if you want bare IDs such as `a`, `b`, and `c`.

## Why does PikaCSS recommend static `pika(...)` arguments?

PikaCSS works entirely at build time. The integration transform finds `pika(...)` calls via regex and evaluates their argument expressions using `new Function('return [...]')`. In practice, the recommended usage is to keep arguments in a literal-only subset so the build stays predictable and side-effect free. That is also the subset enforced by `@pikacss/eslint-config`.

**✅ This works:**

<<< @/.examples/community/faq-static-ok.ts

**❌ This does NOT work:**

<<< @/.examples/community/faq-static-bad.ts

## What does "zero runtime" mean?

PikaCSS does all its work during the build step. Every `pika(...)` call is replaced with the generated class name string (or array) at build time, and the corresponding CSS is written to a generated file. Your production bundle contains **no PikaCSS runtime code** — only plain class name strings and a standard CSS file.

## Can I use both camelCase and kebab-case for CSS properties?

Yes. PikaCSS accepts both formats. Internally, camelCase properties are converted to kebab-case. Both produce identical atomic classes.

<<< @/.examples/community/faq-case.ts

## Does PikaCSS support nested selectors?

Yes. You can nest pseudo-classes, pseudo-elements, media queries, and custom selectors inside your style definitions:

<<< @/.examples/community/faq-nested.ts

## Do I need to import `pika()`?

No. `pika()` is a **global function** — you use it directly in any source file without importing it. The build plugin finds all matched `pika()` calls via source transforms and replaces them with generated class names at build time. The `pika.gen.ts` file provides TypeScript autocomplete through `declare global`, but it is not a module to import from. You should never write `import { pika } from '...'`.

## Why do I need to import `pika.css`?

The unplugin handles a virtual module ID matching `pika.css` and resolves it to the generated CSS codegen file. Importing `pika.css` in your entry file is how the generated CSS is pulled into the bundler's module graph. Note that this is a **CSS import** (for stylesheets), not a JavaScript import for the `pika` function.

## Why is a config file auto-created?

When no config file is found and `autoCreateConfig` is `true` (the default), the integration writes a new `pika.config.js` (or your specified path) seeded with a `defineEngineConfig({})` template. This ensures the TypeScript reference path for autocomplete is set up correctly from the start.

## Can I disable config auto-creation?

Yes. Set `autoCreateConfig: false` in the plugin options. When no config exists, the integration logs a warning and continues with the default engine configuration.

## Which build tools are supported?

PikaCSS works with all major JavaScript bundlers through `@pikacss/unplugin-pikacss`:

| Build Tool | Import Path |
|---|---|
| Vite | `@pikacss/unplugin-pikacss/vite` |
| Rollup | `@pikacss/unplugin-pikacss/rollup` |
| Webpack | `@pikacss/unplugin-pikacss/webpack` |
| esbuild | `@pikacss/unplugin-pikacss/esbuild` |
| Rspack | `@pikacss/unplugin-pikacss/rspack` |
| Rolldown | `@pikacss/unplugin-pikacss/rolldown` |

Additionally, **Nuxt** is supported via the dedicated `@pikacss/nuxt-pikacss` module.

## What are the built-in plugins?

The core engine includes 5 built-in plugins that are always active. You configure them through `defineEngineConfig()` fields — no extra installation needed:

| Plugin | Purpose |
|---|---|
| `important` | Adds `!important` to selected styles |
| `variables` | Defines CSS custom properties with preflight generation |
| `keyframes` | Defines `@keyframes` animations with optional unused pruning |
| `selectors` | Registers custom selector shorthands |
| `shortcuts` | Defines reusable style shortcut strings |

## Which plugin hooks are available?

Hooks are executed on all registered plugins in order (`pre` → default → `post`):

| Hook | Type | Description |
|---|---|---|
| `configureRawConfig` | async | Modify raw config before resolution |
| `rawConfigConfigured` | sync | Called after raw config is set (read-only) |
| `configureResolvedConfig` | async | Modify resolved config |
| `configureEngine` | async | Modify the engine instance after creation |
| `transformSelectors` | async | Transform selector strings |
| `transformStyleItems` | async | Transform style items before extraction |
| `transformStyleDefinitions` | async | Transform style definitions |
| `preflightUpdated` | sync | Called when preflights change |
| `atomicStyleAdded` | sync | Called when a new atomic style is registered |
| `autocompleteConfigUpdated` | sync | Called when autocomplete config changes |

## How are plugin execution order conflicts resolved?

Plugins are sorted by their `order` property: `'pre'` runs first, default (no `order`) runs in the middle, and `'post'` runs last. This ordering applies to both built-in and user plugins.

## Why does generated CSS only include styles that are used?

The variable and keyframe systems have a `pruneUnused` option (defaults to `true`). When enabled, preflight generation only emits variables and keyframes that are actually referenced by the atomic styles in use. This keeps the CSS output minimal.

## Next

- Back to [Plugin System Overview](/plugin-system/overview)
- Revisit [Build-time Compile](/principles/build-time-compile)
- Read [What is PikaCSS](/getting-started/what-is-pikacss)
