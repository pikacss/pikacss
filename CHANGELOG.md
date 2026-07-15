# Changelog

Per-release notes are generated on the
[GitHub Releases](https://github.com/pikacss/pikacss/releases) page from the
commit history. This file records notable and breaking changes that need
migration action; see [MIGRATION.md](./MIGRATION.md) for upgrade steps.

All `@pikacss/*` packages are versioned in lockstep.

## Unreleased

### Breaking

- **unplugin**: `autoCreateConfig` now defaults to `false` — the plugin no
  longer writes a `pika.config.js` into the project automatically.
- **integration**: config evaluation / engine-creation errors now fail the
  build instead of silently falling back to an empty default config. Dev mode
  retains the last known-good engine instead.
- **integration**: config discovery is deterministic and limited to the project
  root (fixed candidate list with defined priority) instead of a recursive glob.

### Changed

- **unplugin**: the default scan `include` now covers `.mjs`/`.cjs`/`.mts`/`.cts`
  in addition to the previous JS family and Vue; the default `exclude` now also
  skips `.git`, `.nuxt`, `.output`, and `coverage`.
- **eslint-config**: `no-dynamic-args` is now scope-aware (skips locally-bound
  `pika`) and accepts the same static argument subset the compiler evaluates,
  removing false positives. The rule documentation URL is fixed.

### Fixed

- **integration**: a user-defined `pika` binding exposed by a Vue
  `<script setup>` block is no longer mistaken for a PikaCSS macro in the
  template.

### Internal

- Added public-API snapshot tests, `publint` + `@arethetypeswrong/cli`
  (ESM-only) publish-correctness gates, coverage thresholds for
  functions/lines/statements, a non-fixing CI lint gate with drift detection,
  and governance docs.
