# Releasing

Maintainer-only. Publishing runs through the `Release` GitHub Actions workflow
(`.github/workflows/release.yml`) using npm trusted publishing (OIDC). All
`@pikacss/*` packages are versioned in **lockstep**.

## Pre-publish gate

The workflow's `validate` step must pass before any version bump:

```
pnpm build && pnpm publint && pnpm attw && pnpm typecheck && pnpm test
```

- `publint` + `attw` (esm-only profile) verify the published package shape and
  type resolution.
- The `release` GitHub Environment gates the job — configure required
  reviewers there for manual approval.

Run the real bundler end-to-end check locally as well when touching the
integration/unplugin path:

```
pnpm build && pnpm test:e2e
```

## Stable release

1. Trigger the `Release` workflow (`workflow_dispatch`) with the desired
   `bump_type` (`patch` / `minor` / `major`).
2. It validates, bumps every package (`bumpp -r`), publishes, and generates
   release notes with the lockfile-pinned `changelogithub`.

## Release-candidate flow (recommended before 1.0.0)

RC builds are published under the `next` dist-tag so they never become the
default `latest` install:

```bash
# 1. Bump to a prerelease version across all packages
pnpm exec bumpp -r 1.0.0-rc.1

# 2. Validate exactly as CI does
pnpm build && pnpm publint && pnpm attw && pnpm typecheck && pnpm test && pnpm test:e2e

# 3. Publish under the `next` tag (not `latest`)
pnpm -r --filter='./packages/*' publish --no-git-checks --tag next
```

Install an RC for testing with `npm i @pikacss/unplugin-pikacss@next`.

Promote to stable only after the RC has been validated against real projects
(a real Vue app, a Nuxt SSR app, a monorepo, and Windows). Then run the normal
stable `Release` flow, which publishes to `latest`.

## Checklist before 1.0.0

- [ ] `P0` count is zero.
- [ ] All bundler adapter fixtures pass.
- [ ] At least one external real-project RC validation round.
- [ ] Public API snapshot tests reflect the intended, frozen surface.
- [ ] Docs no longer mark the API as unstable.
- [ ] `MIGRATION.md`, `SUPPORT.md`, `SECURITY.md` are current.
