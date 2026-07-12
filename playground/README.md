# PikaCSS Playground

An in-browser playground for PikaCSS, built with Vue 3, [WebContainers](https://webcontainers.io/), Monaco, and dockview. It boots a real Vite project inside the browser, installs dependencies with npm, and runs the dev server — so the full PikaCSS transform/codegen pipeline works exactly like a local setup.

## Templates

| Template | Framework | Entry |
|---|---|---|
| `solid-ts` (default) | SolidJS + TSX | `src/App.tsx` |
| `vue-ts` | Vue 3 SFC | `src/App.vue` |
| `react-ts` | React 19 | `src/App.tsx` |

Templates live in `src/templates/<name>/` and are bundled into virtual modules by `plugins/vite-plugin-vfs.ts`. Each template is a standalone Vite project wired with `@pikacss/unplugin-pikacss`. The WebContainer installs from the npm registry; the dependency version is rewritten to the latest published release at build time (see below). Template edits are persisted into the URL hash (lz-string compressed) so playground states are shareable.

## Development

```bash
pnpm --filter @pikacss/playground dev
pnpm --filter @pikacss/playground build
# Requires generated files (pika.gen.ts / vfs.d.ts); run dev or build first:
pnpm --filter @pikacss/playground type-check
```

## Deployment

Deployed to `https://pikacss.github.io/playground/` by `.github/workflows/deploy-docs.yml`, which copies the built output into the docs dist under `playground/`. GitHub Pages cannot send the COOP/COEP headers WebContainers require, so `public/coi-serviceworker.min.js` installs a service worker that injects them (`index.html` loads it first).

## Notes for maintainers

- `src/templates/**` is data, not app code: it is excluded from the app tsconfig, from the repo ESLint run, and from the playground's own PikaCSS scan (`vite.config.ts` → `scan.exclude`).
- Template `package.json` files reference **published** `@pikacss/*` versions (`workspace:` cannot resolve inside the WebContainer). At build/dev time, `vite.config.ts` resolves the **latest published version** from the npm registry and rewrites the template dependency via `vfsPlugin`'s `dependencyVersions` option; the pinned version in the repo is only the offline fallback.
- The `type-check` script (hyphenated, like `demo/`) is intentionally not part of the repo-wide `pnpm typecheck`, because it needs generated files from a prior dev/build run.
- The preview iframe is reloaded once shortly after the dev server becomes ready (`PreviewPanel.vue`): the server signals `server-ready` before PikaCSS has generated `pika.gen.css`, so the first paint is unstyled and Vite's CSS HMR does not retroactively style it — a one-time reload picks up the generated CSS.
