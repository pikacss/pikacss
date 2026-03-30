---
title: ESLint Config
description: Set up ESLint rules to enforce static pika() arguments in your project.
relatedPackages:
  - '@pikacss/eslint-config'
relatedSources:
  - 'packages/eslint-config/src/index.ts'
category: getting-started
order: 50
---

# ESLint Config

PikaCSS provides an ESLint plugin to ensure all `pika()` arguments are statically analyzable at build time.

## Setup

Install the package:

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/eslint-config
```

```sh [npm]
npm install -D @pikacss/eslint-config
```

```sh [yarn]
yarn add -D @pikacss/eslint-config
```

:::

Add the recommended config to your `eslint.config.js`:

```ts
// eslint.config.js
import pikacss from '@pikacss/eslint-config'

export default [
  pikacss(),
]
```

To use a custom function name:

```ts
import pikacss from '@pikacss/eslint-config'

export default [
  pikacss({ fnName: 'css' }),
]
```

## Rules

### no-dynamic-args

#### Description

Enforces that all arguments to `pika()`, `pika.str()`, `pika.arr()`, and their preview variants (`pikap()`, etc.) are statically analyzable at build time. Dynamic values, computed expressions, and runtime variables are not supported.

#### What Counts as Static

- String literals: `'flex-center'`
- Object literals with string/number values: `{ color: 'red' }`
- Array literals of the above: `[{ color: 'red' }, 'flex-center']`
- Template literals without expressions: `` `literal` ``
- References to `const` declarations initialized with static values

The following are **not** static:

- Variable references (non-const or with dynamic initializers)
- Function calls
- Conditional expressions
- Spread operators
- Template literals with expressions

#### Examples

```ts
// ✅ Valid
pika({ color: 'red' })
pika({ 'color': 'red', '$:hover': { color: 'blue' } })
pika('flex-center')

// ❌ Invalid — dynamic variable
const color = getColor()
pika({ color })

// ❌ Invalid — conditional
pika(isDark ? { color: 'white' } : { color: 'black' })

// ❌ Invalid — spread
pika({ ...baseStyles })
```

## Next

- [Integrations](/integrations/unplugin) — configure PikaCSS with your build tool.
- [Usage](/getting-started/usage) — see common style patterns.
