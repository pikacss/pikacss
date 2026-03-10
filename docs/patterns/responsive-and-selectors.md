# Responsive And Selectors

Selectors are where PikaCSS stops feeling like a small helper and starts feeling like a system. They let you encode states, themes, and breakpoints once, then reuse them everywhere.

## Define selectors in config

<<< @/.examples/guide/selectors-config.ts

## Use them in style definitions

<<< @/.examples/guide/selectors-usage.ts

<<< @/.examples/guide/selectors-output.css

## Keep responsive naming boring

Your selectors should be easy to scan and easy to remember. Prefer project-wide aliases like `screen-sm`, `screen-md`, and `screen-lg` over one-off media query strings spread through component files.

## Nested selectors are still static

Nested selector blocks stay within the build-time model because the structure is declared in source.

<<< @/.examples/getting-started/first-pika-nested.vue

## Recommended patterns

- Put breakpoint aliases in config, not in individual components.
- Keep selector names semantic enough for team-wide reuse.
- Use selectors for state structure and variables for value changes.
- Use shortcuts when a selector-driven pattern repeats across components.

::: warning Do not overload selectors
If a selector name hides too many unrelated rules, reviews become harder and local overrides become unpredictable. A selector alias should describe a stable condition, not a whole component contract.
:::

## Next

- [Theming And Variables](/patterns/theming-and-variables)
- [Configuration](/guide/configuration)
- [Component Styling](/patterns/component-styling)
- [Plugins: Typography](/plugins/typography)
