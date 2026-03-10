# Static Arguments

This is the most important constraint in PikaCSS.

`pika()` is evaluated from source code at build time. That means the integration needs to understand the argument shape without running your application. If the style input depends on runtime state, PikaCSS cannot reliably transform it.

## What is safe

Literal objects, arrays, strings, nested literal structures, and stable composition are the happy path.

<<< @/.examples/community/faq-static-ok.ts

## What is not safe

Runtime function calls, mutable state, computed member access, or arbitrary expressions inside `pika()` break the build-time model.

<<< @/.examples/community/faq-static-bad.ts

<<< @/.examples/integrations/eslint-invalid-example.ts

## Why this limitation exists

PikaCSS gets its value from this boundary:

- It can transform source into deterministic atomic CSS.
- It can deduplicate declarations because it knows the style content up front.
- It can generate autocomplete types and plugin-defined tokens.
- It keeps runtime bundles free of styling work.

If the engine accepted arbitrary runtime values, those guarantees would collapse.

## Recommended alternatives

When you think you need runtime style logic, pick one of these patterns first:

1. Predeclare variants and switch class names at runtime.
2. Move repeated combinations into shortcuts.
3. Move theme values or per-instance dynamic values into CSS variables.
4. Move state differences into selectors such as `hover`, `focus`, or custom aliases.
5. Compute which static style block to use, not the contents of the block itself.

::: tip A good mental model
Choose between static style definitions at runtime. Do not compute style definitions at runtime.
:::

If the value itself still has to change at runtime, read [Dynamic Values With CSS Variables](/patterns/dynamic-values-with-css-variables).

## Enforce the rule early

Use the ESLint integration so mistakes are caught in editor and CI instead of only during build output inspection.

<<< @/.examples/integrations/eslint-valid-example.ts

## Do and do not

| Do | Do not |
| --- | --- |
| Predeclare a `primary`, `secondary`, and `danger` style variant. | Build a style object from API data inside `pika()`. |
| Use CSS variables for theme values. | Read a runtime theme object directly from the call. |
| Use selectors and shortcuts to encode recurring patterns. | Rebuild the same logic with ad hoc computed objects in each component. |

## Next

- [Zero Config](/getting-started/zero-config)
- [Dynamic Values With CSS Variables](/patterns/dynamic-values-with-css-variables)
- [ESLint](/integrations/eslint)
- [Component Styling](/patterns/component-styling)
- [Common Problems](/troubleshooting/common-problems)
