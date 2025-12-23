# Package map and pointers

## Packages
- @pikacss/core: core engine; tsdown build; exports ESM/CJS with typed entrypoints.
- @pikacss/integration: shared integration utilities; depends on core; used by unplugin adapters.
- @pikacss/unplugin-pikacss: unplugin wrapper targeting Vite/Rollup/Webpack/Esbuild/Rspack/Farm/Rolldown; uses integration.
- @pikacss/vite-plugin-pikacss: Vite-specific thin wrapper around @pikacss/unplugin-pikacss.
- @pikacss/nuxt-pikacss: Nuxt module powered by @pikacss/unplugin-pikacss.
- @pikacss/plugin-icons: Icons plugin; depends on @pikacss/core and @unocss/preset-icons.

## Docs (developer-relevant)
- Guides and advanced notes: docs/guide/*.md, docs/advanced/*.md
- Integrations (bundlers/frameworks): docs/integrations/*.md
- Plugins: docs/plugins/*.md and docs/llm/*.md (LLM-oriented hooks)

## Examples
- Bundler/framework samples: examples/* (e.g., vite-react, vite-vue3, vite-solidjs, nuxt, webpack-react, rspack-react, farm-react, esbuild-react)

## Validation
- Exports validation via publint in each package; ensure dist artifacts match exports maps before publish.
