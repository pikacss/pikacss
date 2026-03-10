# How PikaCSS Works

At a high level, PikaCSS turns statically analyzable style input into generated atomic CSS.

## Source input

You write `pika()` calls in supported files:

<<< @/.examples/principles/build-source.ts

## Build-time transform

The integration scans source files, extracts the style input, and turns it into atomic class names.

<<< @/.examples/principles/build-compiled.ts

## Generated CSS

Those class names point to generated CSS declarations:

<<< @/.examples/principles/build-generated.css

## Why atomic output matters here

PikaCSS does not emit one class per component block. It breaks style content into reusable atomic declarations. When the same declaration appears again, the engine can reuse the same atomic class.

<<< @/.examples/principles/build-dedup-source.ts

<<< @/.examples/principles/build-dedup-output.css

## Where PikaCSS is more careful than many atomic systems

Reuse is not always safe.

When two declarations overlap in effect, the real winner is determined by stylesheet order, not by the order of tokens in markup. PikaCSS detects these collisions and keeps later overlapping declarations order-sensitive instead of blindly reusing one global atomic class.

Read [Atomic Order And Cascade](/concepts/atomic-order-and-cascade) for the full explanation.

## What plugins change

Plugins can modify config, extend selectors, shortcuts, variables, keyframes, autocomplete, and preflights. They change what the engine understands before and during extraction.

That is why PikaCSS can stay small for end users while still supporting richer ecosystems.

## What stays out of runtime

The application runtime receives class names and CSS files, not a styling engine that keeps interpreting objects in the browser.

## Next

- [Atomic Order And Cascade](/concepts/atomic-order-and-cascade)
- [Build-time Engine](/concepts/build-time-engine)
- [Generated Files](/guide/generated-files)
- [Plugin System Overview](/plugin-system/overview)
- [Common Problems](/troubleshooting/common-problems)
