# Common Problems

When PikaCSS output looks wrong, the problem is usually one of a small set of misunderstandings.

## `pika()` did not generate what I expected

Check these first:

1. Is the file included in scan patterns?
2. Is `pika.css` imported?
3. Is the style input static?
4. Did you inspect generated CSS or generated typings?

## I used runtime values inside `pika()`

This is the most common issue.

<<< @/.examples/community/faq-static-bad.ts

Use predeclared variants, selectors, shortcuts, or variables instead.

If you are trying to pass per-instance runtime values, use CSS variables and bind them yourself as described in [Dynamic Values With CSS Variables](/patterns/dynamic-values-with-css-variables).

<<< @/.examples/community/faq-static-ok.ts

## I edited generated files and my changes disappeared

That is expected. Generated files are output artifacts, not source files. Fix the source call, config, or integration setup instead.

## I added a plugin but nothing changed

Verify whether you configured a built-in capability or registered an external plugin. They use different configuration entry points.

## My theme logic feels repetitive

That is usually a signal to move token values into variables and move theme context into selectors.

## The build works but team usage is drifting

Add the ESLint integration and standardize config-level selectors, variables, and shortcuts. PikaCSS stays maintainable when project conventions are centralized.

## Next

- [Static Arguments](/getting-started/static-arguments)
- [Dynamic Values With CSS Variables](/patterns/dynamic-values-with-css-variables)
- [Generated Files](/guide/generated-files)
- [ESLint](/integrations/eslint)
- [FAQ](/community/faq)
