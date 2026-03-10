# Generated Files

PikaCSS uses generated artifacts on purpose. You should know what they are so you do not accidentally treat generated output as hand-maintained source.

## `pika.css`

`pika.css` is a virtual module. You import it in your app entry, but you do not edit it directly.

<<< @/.examples/integrations/import-pika-css.ts

## `pika.gen.ts`

This file provides generated typing and autocomplete support. It may augment the global `pika()` function, plugin-defined selectors, shortcuts, variables, and more.

## `pika.gen.css`

This file is the generated CSS written to disk by the integration.

::: warning Do not edit generated files
Changes to generated files are overwritten. If the output is wrong, fix the source style definition, engine config, or integration setup instead.
:::

## When generated files are useful

Generated files are excellent for debugging:

- confirm whether a `pika()` call was transformed
- inspect which selectors or declarations were emitted
- verify that autocomplete includes expected plugin data

## When generated files are not the solution

- They are not the place to customize design tokens.
- They are not the place to fix broken selectors.
- They are not the place to add preflights or plugins.

Those changes belong in config or source.

## Next

- [How PikaCSS Works](/concepts/how-pikacss-works)
- [Configuration](/guide/configuration)
- [Common Problems](/troubleshooting/common-problems)
- [Vite](/integrations/vite)
