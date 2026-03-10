# Build-time Compile

PikaCSS is a **build-time** CSS engine. Every `pika()` call in your source code is evaluated and replaced during the build process — before your application ever runs in the browser. The result is plain string literals in your JavaScript and a pre-generated CSS file. There is no runtime style engine.

## How the Build Pipeline Works

When your build tool (Vite, Webpack, Rollup, esbuild, Rspack, or Rolldown) processes your source files, the PikaCSS unplugin intercepts them and performs a multi-stage transformation:

### Stage 1: Function Call Detection

The plugin scans each source file using a regex to find all `pika()` calls, including format variants (`pika.str()`, `pika.arr()`) and preview variants (`pikap()`). It uses a bracket-depth parser to correctly extract the full function call, handling nested parentheses, strings, comments, and template literals.

::: info Global Function
`pika()` is a global function — you do not import it. The build plugin detects and replaces these calls during source transforms. The generated `pika.gen.ts` provides TypeScript support through `declare global`, not through module exports.
:::

### Stage 2: Argument Evaluation

The extracted argument string is evaluated at build time using `new Function(...)`. For example, `pika({ color: 'red', fontSize: '16px' })` has its argument parsed as a JavaScript object literal and executed. In practice, this means the safest usage is still the literal-only subset enforced by the ESLint rule, because those inputs remain predictable and side-effect free during the build.

### Stage 3: Atomic Style Extraction

The evaluated arguments are passed to `engine.use()`, which:

1. **Transforms style items** through the plugin hook pipeline (resolving shortcuts, handling nested selectors, etc.)
2. **Extracts atomic style contents** — each CSS property-value pair becomes an independent unit with its own selector, property, and value
3. **Deduplicates** — if the same property appears multiple times for the same selector, only the last value wins (CSS override semantics)

### Stage 4: Atomic ID Generation

Each unique combination of `[selector, property, value]` receives a short, unique class name. IDs are generated sequentially using a bijective base-52 encoding (`a`–`z`, `A`–`Z`, `aa`, `ba`, ...) via the `numberToChars()` function. If the same property-value-selector combination is encountered again (even in a different file), it reuses the existing ID.

### Stage 5: Code Replacement

Using MagicString, the plugin replaces each `pika()` call with its output — the generated class names in the configured format. The original function call is completely removed from the code. Sourcemaps are generated to preserve debugging capability.

### Stage 6: CSS Code Generation

After all files are processed, the engine renders all collected atomic styles into a CSS file (`pika.gen.css` by default). The generated file starts with an `@layer` order declaration (`@layer preflights, utilities;`), followed by preflights and atomic utilities — each wrapped in their respective `@layer` blocks. TypeScript type definitions are also written to `pika.gen.ts` for autocomplete support.

## Before and After

**Source code (what you write):**

<<< @/.examples/principles/build-source.ts

**Compiled output (what runs in the browser):**

<<< @/.examples/principles/build-compiled.ts

**Generated CSS (`pika.gen.css`):**

<<< @/.examples/principles/build-generated.css

## Output Formats

PikaCSS supports two output formats for transformed `pika()` calls. The format can be set globally via the `transformedFormat` plugin option, or forced per-call using method variants.

### String Format (default)

`pika()` or `pika.str()` produces a space-joined string of class names:

<<< @/.examples/principles/build-format-string.ts

### Array Format

`pika.arr()` produces an array of class name strings, useful for frameworks that accept class arrays:

<<< @/.examples/principles/build-format-array.ts

## Recommended Static Subset

Because arguments are evaluated at build time with `new Function(...)`, the recommended usage is to keep them in a literal-only subset that can be understood without application runtime state. This is the subset enforced by `@pikacss/eslint-config`.

**Valid — static values the build can evaluate:**

<<< @/.examples/principles/build-valid-usage.ts

**Avoid — runtime values and dynamic expressions that make builds harder to reason about:**

<<< @/.examples/principles/build-invalid-usage.ts

::: tip
If you need dynamic styling, use CSS custom properties (variables) in your `pika()` definitions and change their values at runtime via JavaScript or inline styles.
:::

## Atomic CSS Deduplication

PikaCSS generates **atomic CSS** — each unique CSS property-value pair maps to exactly one class. When the same declaration appears in multiple components, it is automatically deduplicated across the entire application.

**Two components sharing styles:**

<<< @/.examples/principles/build-dedup-source.ts

**Generated CSS — only 4 classes, not 6:**

<<< @/.examples/principles/build-dedup-output.css

This approach minimizes CSS output size: as your application grows, the CSS file grows logarithmically rather than linearly, since most new components reuse existing property-value pairs.

## Build vs. Serve Mode

The unplugin behaves differently depending on the mode:

- **Build mode** (`production`): Runs `fullyCssCodegen()` at `buildStart`, which scans all matched files, collects all style usages, and writes the complete CSS file before bundling begins.
- **Serve mode** (`development`): Transforms files on-demand as they are requested. CSS and TypeScript codegen files are written incrementally with debouncing (300ms) as files change.

## Next

- [Zero Side-effect](/principles/zero-sideeffect)
- [Integrations Overview](/integrations/overview)
- [ESLint Configuration](/integrations/eslint)
