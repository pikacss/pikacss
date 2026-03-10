# Build-time Engine

PikaCSS is easiest to use when you remember one rule: the styling engine runs during the build, not in the browser.

## Zero runtime overhead means exactly that

Once transformed, your production bundle carries static class names and generated CSS. There is no client-side styling engine resolving objects on page load.

<<< @/.examples/principles/zero-source.ts

<<< @/.examples/principles/zero-compiled.ts

<<< @/.examples/principles/zero-generated.css

## Why the engine wants static inputs

The build-time architecture enables:

- deterministic output
- atomic deduplication
- generated autocomplete
- plugin-controlled config resolution

It also means you must express variation through static shapes: variants, selectors, shortcuts, and variables.

## Virtual modules and generated files

The import `pika.css` is a virtual module. It resolves to generated CSS at build time. On disk, the integration may also write files such as `pika.gen.ts` and `pika.gen.css`.

Read [Generated Files](/guide/generated-files) before treating any generated artifact as source code.

## The correct design question

Do not ask, "How do I make `pika()` accept this runtime value?"

Ask, "Which static representation of this styling problem should my project encode?"

That shift usually leads to a better result anyway.

## Next

- [Static Arguments](/getting-started/static-arguments)
- [Generated Files](/guide/generated-files)
- [Responsive And Selectors](/patterns/responsive-and-selectors)
- [Theming And Variables](/patterns/theming-and-variables)
