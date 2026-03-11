# Theming And Variables

If you find yourself repeating color branches in multiple components, the problem is usually design tokens, not missing runtime logic.

## Define variables in config

<<< @/.examples/guide/config-variables.ts

You can scope variable definitions under selectors to create theme-specific values.

<<< @/.examples/guide/config-variables-transitive.ts

If a token also belongs to a stable value family such as color or length, add `semanticType` so autocomplete stays scoped to matching CSS properties instead of appearing everywhere.

<<< @/.examples/guide/config-variables-semantic-type.ts

## Use variables in components

<<< @/.examples/guide/variables-usage.ts

<<< @/.examples/guide/variables-output.css

If the variable value has to change per instance at runtime, see [Dynamic Values With CSS Variables](/patterns/dynamic-values-with-css-variables).

## A practical theming strategy

1. Use selectors to describe theme context such as light or dark.
2. Use variables to carry the actual token values.
3. Keep component style definitions focused on semantic token usage.

That separation is easier to maintain than duplicating full dark and light component objects.

## Do and do not

| Do | Do not |
| --- | --- |
| Store theme values in CSS variables. | Duplicate entire components for each theme without reason. |
| Scope variable definitions with selectors. | Put theme logic into runtime object construction. |
| Keep component objects semantic. | Hardcode every token in every component. |

## Next

- [Dynamic Values With CSS Variables](/patterns/dynamic-values-with-css-variables)
- [Configuration](/guide/configuration)
- [Plugins: Typography](/plugins/typography)
- [Static Arguments](/getting-started/static-arguments)
- [Common Problems](/troubleshooting/common-problems)
