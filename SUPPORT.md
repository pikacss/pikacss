# Support & Compatibility Policy

## Module system: ESM-only

All `@pikacss/*` packages are **ESM-only**. They ship `"type": "module"` with
`import`-only `exports` and no CommonJS build. This means:

- Requires a **Node ESM** environment. There is no `require()` entry point.
- Bundler config files that load PikaCSS must be ESM — use `.mjs` (e.g.
  `webpack.config.mjs`, `rspack.config.mjs`) or `"type": "module"` in the
  nearest `package.json`.
- Type resolution is validated in CI with `publint` and
  `@arethetypeswrong/cli` (esm-only profile).

## Node.js

- Supported: **Node.js >= 22**.
- Older majors are not supported.

## Bundlers

PikaCSS integrates through [unplugin](https://github.com/unjs/unplugin), so it
exposes entry points for several bundlers:

| Bundler  | Entry                              | Status |
| -------- | ---------------------------------- | ------ |
| Vite     | `@pikacss/unplugin-pikacss/vite`   | Primary — declared peer (Vite 7/8), covered by tests/fixtures |
| Rollup   | `@pikacss/unplugin-pikacss/rollup` | Supported via unplugin |
| webpack  | `@pikacss/unplugin-pikacss/webpack`| Supported via unplugin |
| esbuild  | `@pikacss/unplugin-pikacss/esbuild`| Supported via unplugin |
| Rspack   | `@pikacss/unplugin-pikacss/rspack` | Supported via unplugin |
| Rolldown | `@pikacss/unplugin-pikacss/rolldown`| Supported via unplugin |

Only Vite is declared as an (optional) `peerDependency`. The other bundlers are
intentionally **not** pinned as peers: their supported version ranges track
unplugin's, and declaring narrow ranges here would produce spurious install
warnings. Bring your own bundler at the version your project already uses.

## Frameworks

- **Vue SFC** (`<script>`, `<script setup>`, and `<template>`) via
  `@vue/compiler-sfc`.
- **Nuxt** via `@pikacss/nuxt-pikacss` (peers on `@nuxt/kit` / `@nuxt/schema`).
- **React / JSX / TSX** and plain JS/TS through the JS processor
  (`.js .mjs .cjs .jsx .ts .mts .cts .tsx`).

## Versioning

- All `@pikacss/*` packages are versioned in **lockstep** (same version).
- After 1.0.0, the project follows semantic versioning. The public export
  surface of each package's main entry is guarded by a `public-api` snapshot
  test; additions/removals are deliberate, reviewed changes.
- Low-level compiler internals currently re-exported from
  `@pikacss/integration` are **not** part of the stable surface and may move
  behind a dedicated subpath before or after 1.0 — depend on the documented,
  consumer-facing API only.
