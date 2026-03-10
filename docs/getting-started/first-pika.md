# First Pika

The goal of this page is simple: get one successful `pika()` flow working, inspect the output, and understand what the engine transformed for you.

## Entry setup

Import the virtual CSS module in your application entry:

<<< @/.examples/getting-started/first-pika-entry.ts

## Minimal style definition

This is the smallest useful `pika()` call:

<<< @/.examples/getting-started/first-pika-basic.ts

If you are working in Vue, the same idea looks like this:

<<< @/.examples/getting-started/first-pika-basic.vue

## What the output becomes

PikaCSS does not keep this object around at runtime. It transforms the call into atomic class names and emits CSS during the build.

<<< @/.examples/getting-started/first-pika-output.css

## Multiple arguments are normal

Use multiple `pika()` arguments to separate stable base styles from local overrides.

<<< @/.examples/getting-started/first-pika-multiple-args.vue

That composition pattern scales much better than one giant object.

## String and array variants

Use the output form that best matches your framework and calling style.

<<< @/.examples/getting-started/first-pika-variants.ts

## Nested selectors are part of the model

You do not need to leave the style object when you add pseudo states or at-rules.

<<< @/.examples/getting-started/first-pika-nested.vue

<<< @/.examples/getting-started/first-pika-nested-output.css

## Do and do not

| Do | Do not |
| --- | --- |
| Start with literal objects and simple composition. | Start with dynamic expressions and debug build failures later. |
| Inspect generated CSS once so the model becomes concrete. | Treat `pika()` like a runtime helper that can read current state. |
| Split base styles and overrides across multiple arguments. | Put every variant branch inside one massive style object. |

## Next

- [Static Arguments](/getting-started/static-arguments)
- [How PikaCSS Works](/concepts/how-pikacss-works)
- [Component Styling](/patterns/component-styling)
- [Generated Files](/guide/generated-files)
