# Command cheatsheet

## Install and setup
- Install deps: pnpm install
- Hooks: pnpm prepare (simple-git-hooks) sets up lint-staged

## Core tasks
- Build all packages: pnpm build
- Build one package: pnpm --filter @pikacss/<pkg> build
- Typecheck all: pnpm typecheck
- Typecheck one package: pnpm --filter @pikacss/<pkg> typecheck
- Tests (vitest run): pnpm test
- Tests per package: pnpm --filter @pikacss/<pkg> test
- Lint: pnpm lint (eslint --fix .)

## Docs
- Dev server: pnpm docs:dev
- Build: pnpm docs:build
- Preview: pnpm docs:preview

## Publish/quality
- Publint all: pnpm publint
- Publint one package: pnpm --filter @pikacss/<pkg> exec publint
- Release chain (build + docs + typecheck + publint + clean dist + bump): pnpm release (use only when ready to publish)
- Prepare local install (build + local tarballs): pnpm prepare:local

## Scaffolding
- New package generator: pnpm newpkg (interactive; writes under packages/)

## Tips
- Use pnpm --filter to scope tasks; prefer pnpm -r only when necessary.
- Keep docs/examples in sync with package changes to avoid regressions.
