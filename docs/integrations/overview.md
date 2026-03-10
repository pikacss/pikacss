# Integrations Overview

PikaCSS has one engine and multiple build-tool adapters. The authoring model stays the same across integrations; the setup surface changes.

## Choose your path

| If you are using | Go to |
| --- | --- |
| Vite | [Vite](/integrations/vite) |
| Nuxt | [Nuxt](/integrations/nuxt) |
| Another bundler powered by unplugin | [Vite](/integrations/vite) for the baseline mental model |
| CI/editor enforcement of static rules | [ESLint](/integrations/eslint) |

## Quick mental model

All integrations need the same conceptual pieces:

1. source scanning for `pika()` calls
2. config loading or auto-creation
3. CSS and type generation
4. virtual module support for `pika.css`

<<< @/.examples/integrations/plugin-options.ts

## What changes by integration

- how the plugin is registered
- how file scanning fits into the bundler
- framework-specific defaults
- how dev server updates surface during authoring

## Recommended first choice

If you can choose freely, start with Vite. It gives the clearest setup and the fastest feedback loop.

## Next

- [Vite](/integrations/vite)
- [Nuxt](/integrations/nuxt)
- [ESLint](/integrations/eslint)
- [Configuration](/guide/configuration)
