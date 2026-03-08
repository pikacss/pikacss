# Zero Side-effect

PikaCSS produces **zero runtime side effects**. After build-time compilation, your JavaScript contains no style engine, no CSS generation logic, and no DOM manipulation for styling. The only artifacts are plain string literals in your code and a static CSS file.

## What "Zero Side-effect" Means

In traditional CSS-in-JS libraries, the style engine ships to the browser and runs at runtime — it parses style objects, generates CSS, hashes class names, and injects `<style>` tags into the DOM. Each of these steps is a **side effect** that consumes CPU cycles and delays rendering.

PikaCSS eliminates all of these runtime side effects by performing every step during the build:

| Step | Traditional CSS-in-JS | PikaCSS |
|---|---|---|
| Style parsing | Runtime | Build time |
| Class name generation | Runtime | Build time |
| CSS generation | Runtime | Build time |
| DOM injection | Runtime `<style>` tags | Static CSS file |
| Style engine in bundle | Yes (10–50 KB+) | No (0 KB) |

## Compiled Output: Pure String Literals

After the build plugin transforms your code, `pika()` calls become plain string literals. The `pika` function calls are completely removed — they don't exist at runtime.

**Source code:**

<<< @/.examples/principles/zero-source.ts

**After compilation:**

<<< @/.examples/principles/zero-compiled.ts

Notice that:
- `pika()` calls become string constants like `'a b c'`
- No function calls remain in the compiled output — only plain string literals
- The exported function is pure — no hidden runtime dependencies

## The Only Runtime Artifact

The **only** artifact PikaCSS adds to your runtime bundle is a static CSS file (`pika.gen.css` by default). This file is imported via the virtual module `pika.css`, which the unplugin resolves to the generated CSS file:

<<< @/.examples/principles/zero-generated.css

This CSS file:
- Is generated once at build time
- Contains all atomic style classes used across the application
- Is served as a regular static asset — cached by the browser like any other stylesheet
- Adds zero JavaScript to the runtime bundle

## Tree-shaking Support

Because compiled `pika()` calls are just string literals, they are inherently **tree-shakeable**. If a variable holding a compiled style string is never used, the bundler's dead-code elimination removes it entirely.

**Source code with unused styles:**

<<< @/.examples/principles/zero-tree-shake-source.ts

**After compilation and tree-shaking:**

<<< @/.examples/principles/zero-tree-shake-compiled.ts

The `unusedStyles` variable, which was compiled to a plain string `'c d'`, is recognized by the bundler as unused and eliminated. No side effects means the bundler can safely remove it.

::: info
The CSS for unused styles may still appear in `pika.gen.css` if the `pika()` call was present in a scanned file during build. However, the unused CSS classes will not inflate your JavaScript bundle, and future PikaCSS versions may support CSS-level pruning as well.
:::

## Comparison with Traditional CSS-in-JS

<<< @/.examples/principles/zero-comparison.ts

### Runtime cost breakdown

- **Traditional CSS-in-JS**: Ships a style engine (often 10–50 KB+ gzipped), parses style objects on every render, generates and injects CSS at runtime, and may cause layout thrashing.
- **PikaCSS**: Ships zero additional JavaScript. Styles are pre-computed static strings. CSS is a regular static file loaded once. No rendering delay from style computation.

## Implications for Your Application

1. **Faster initial load**: No style engine JavaScript to download, parse, or execute
2. **No runtime overhead**: Style resolution happens at build time, not on every render
3. **Better caching**: The generated CSS file is a static asset that can be aggressively cached
4. **Smaller bundle size**: No runtime dependencies for styling — just string literals
5. **No flash of unstyled content**: CSS is available as a static file from the start, not generated after JavaScript executes

## Next

- [Integrations Overview](/integrations/overview)
- [Build-Time Compile](/principles/build-time-compile)
- [What Is PikaCSS?](/getting-started/what-is-pikacss)
