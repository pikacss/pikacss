# FAQ

## Is `pika()` a runtime function?

No. It is build-time input. The call is scanned and transformed during the build.

## Why do static arguments matter so much?

Because static input is what allows PikaCSS to generate deterministic atomic CSS, deduplicate declarations, and provide generated autocomplete.

See [Static Arguments](/getting-started/static-arguments).

## Is PikaCSS just another utility CSS framework?

No. The output is atomic CSS, but the authoring model is style-definition based. You write style objects and plugin-driven config, not only predefined utility class tokens.

<<< @/.examples/community/faq-atomic-input.ts

<<< @/.examples/community/faq-atomic-output.css

## Does class token order decide the final result?

Not by itself.

When atomic declarations have the same specificity, the browser still resolves conflicts by stylesheet declaration order. That is why overlapping utilities can produce surprising results in many atomic systems.

PikaCSS detects overlapping property effects and keeps later overlapping declarations order-sensitive, so local author order stays meaningful where it actually affects the cascade.

See [Atomic Order And Cascade](/concepts/atomic-order-and-cascade).

## Can I use nested selectors?

Yes. Nested selectors are part of the normal style-definition model.

<<< @/.examples/community/faq-nested.ts

## Should I keep zero-config forever?

Usually no. Zero-config is a fast starting point. Real projects should centralize selectors, variables, shortcuts, and plugin usage in config.

## Should I edit `pika.gen.ts` or `pika.gen.css`?

No. Generated files are output artifacts. Fix config or source instead.

## When should I use the ESLint integration?

As early as possible. It prevents invalid runtime-style habits from spreading through the codebase.

## Next

- [Static Arguments](/getting-started/static-arguments)
- [Common Problems](/troubleshooting/common-problems)
- [Configuration](/guide/configuration)
- [Plugin System Overview](/plugin-system/overview)
