# Dynamic Values With CSS Variables

PikaCSS does not include a styling runtime. That is where a lot of its performance and predictability come from, but it also changes how you handle dynamic styling.

If a value must change at runtime, keep the style definition static inside `pika()` and bind the changing value to a CSS variable yourself.

## Pick the right pattern for the job

| Need | Pattern | Why |
| --- | --- | --- |
| A finite set of visual states | Predeclare variants and switch class names at runtime. | PikaCSS can still scan every style shape ahead of time. |
| A continuous or per-instance value | Use `var(--...)` inside `pika()` and bind the variable at runtime. | The style shape stays static while the value remains dynamic. |
| Shared theme tokens | Define variables in config and scope them with selectors. | The design system stays centralized and reusable. |

## What not to do

This is the runtime CSS-in-JS habit that usually causes the first mismatch with PikaCSS.

<<< @/.examples/patterns/dynamic-values-bad.tsx

`pika()` cannot safely evaluate that object because the actual style values only exist after your app runs.

## Bind runtime values through CSS variables

The fix is not to force more runtime into `pika()`. The fix is to let PikaCSS generate static declarations that reference CSS variables, then update those variables from your framework or DOM code.

<<< @/.examples/patterns/dynamic-values-react.tsx

This works because PikaCSS only needs to emit `width: var(--progress-width)` and `background-color: var(--progress-color)`. Your app still owns the runtime binding step.

## Keep style shape static, switch variants separately

Many components need both kinds of dynamism at the same time:

1. Discrete states such as `solid` or `outline`
2. Per-instance values such as a brand color from data

Handle them separately.

<<< @/.examples/patterns/dynamic-values-variants.tsx

Choose the static class name at runtime. Bind the changing token value through a CSS variable.

## A useful migration mental model

If you are coming from traditional runtime CSS-in-JS, this shift matters:

1. Do not build style objects from runtime data.
2. Do choose among predeclared style objects at runtime.
3. Do push changing values into CSS variables.
4. Do let the app layer own how those variables are assigned.

::: tip The boundary to remember
PikaCSS can generate `var(--accent)` references for you. It will never manage `--accent` state for you.
:::

For shared tokens and theme switching, continue with [Theming And Variables](/patterns/theming-and-variables).

## Next

- [Static Arguments](/getting-started/static-arguments)
- [Theming And Variables](/patterns/theming-and-variables)
- [Component Styling](/patterns/component-styling)
- [Common Problems](/troubleshooting/common-problems)
