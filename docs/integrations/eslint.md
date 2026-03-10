# ESLint Configuration

PikaCSS provides an ESLint configuration package that enforces the predictable static subset recommended for `pika()` function calls. The transformer evaluates matched arguments at build time, and this rule keeps those arguments limited to literal-only shapes so builds stay explicit and side-effect free.

This package provides a ready-to-use flat config preset for **ESLint 9+**. It will not work with legacy `.eslintrc` configurations.

## Installation

::: code-group
<<< @/.examples/integrations/eslint-install.sh [pnpm]
<<< @/.examples/integrations/eslint-install-npm.sh [npm]
<<< @/.examples/integrations/eslint-install-yarn.sh [yarn]
<<< @/.examples/integrations/eslint-install-bun.sh [bun]
:::

::: warning ESLint 9+ Required
This plugin requires ESLint 9.0.0 or higher and uses the flat config format. It is not compatible with `.eslintrc.*` configuration files.
:::

## Basic Setup

Add the configuration to your `eslint.config.mjs` (or `.js`, `.ts`):

<<< @/.examples/integrations/eslint-basic-config.mjs

This automatically applies the `pikacss/no-dynamic-args: 'error'` rule, which validates that all `pika()` calls stay within the predictable literal subset enforced by the rule.

::: tip Simplicity
The new flat config format reduces setup from 5+ lines to just 2 lines. The `pikacss()` function returns a pre-configured ESLint config object ready to use in your config array.
:::

## Alternative Setup

### Using Named Export

If you prefer explicit imports, use the `recommended` named export:

<<< @/.examples/integrations/eslint-recommended-config.mjs

This is functionally identical to the default export but makes the intent clearer in your config file.

### Manual Configuration

For fine-grained control, import the `plugin` object and configure rules manually:

<<< @/.examples/integrations/eslint-advanced-config.mjs

::: info When to Use Manual Configuration
Manual configuration is useful when you need to:
- Customize rule severity or options per-file
- Integrate with complex ESLint config setups
- Combine with other plugins that require specific ordering
:::

## Rules Reference

### `pikacss/no-dynamic-args`

**Disallows dynamic arguments in the stricter static subset enforced by the ESLint rule.**

PikaCSS evaluates matched `pika()` arguments at build time. This rule intentionally enforces a narrower, predictable subset: literal values, object/array literals with static values, static spreads, and other recursively static structures.

**Valid** (static):

<<< @/.examples/integrations/eslint-valid-example.ts

**Invalid** (dynamic):

<<< @/.examples/integrations/eslint-invalid-example.ts

**Error output example:**

<<< @/.examples/integrations/eslint-error-output.txt

### What does the rule allow?

An expression is accepted by this rule when it stays inside the literal-only subset that can be checked directly from the AST. This includes:

- **Literals**: `'red'`, `16`, `-1`, `null`, `` `red` ``
- **Object literals**: `{ color: 'red', fontSize: 16 }`
- **Array literals**: `['color-red', 'font-bold']`
- **Nested structures**: `{ '&:hover': { color: 'blue' } }`
- **Static spreads**: `{ ...{ color: 'red' } }` (spread of a static object literal)
- **Unary expressions**: `-1`, `+2`

These are rejected by the rule:

- **Variables**: `pika({ color: myColor })`
- **Function calls**: `pika({ color: getColor() })`
- **Template literals with expressions**: `` pika({ fontSize: `${size}px` }) ``
- **Conditionals**: `pika({ color: isDark ? 'white' : 'black' })`
- **Member access**: `pika({ color: theme.primary })`
- **Binary/logical expressions**: `pika({ width: x + 10 })`
- **Dynamic spreads**: `pika({ ...baseStyles })`
- **Dynamic computed keys**: `pika({ [key]: 'value' })`

::: info Rule Scope
The rule is intentionally stricter than the transformer. It exists to keep `pika()` usage predictable in teams and CI, not to document every build-time expression the transformer might technically evaluate.
:::

::: tip Why This Restriction?
PikaCSS compiles styles at build time, not runtime. Keeping arguments in a literal-only subset makes transforms easier to reason about and avoids accidental build-time side effects. See [Build-Time Compile](/principles/build-time-compile) for conceptual details.
:::

## Configuration

### `fnName`

Customize the function name to detect if `pika` conflicts with another identifier in your project:

<<< @/.examples/integrations/eslint-custom-fnname.mjs

When `fnName` is set to `'css'`, the rule will detect:

- `css()`, `cssp()`
- `css.str()`, `css.arr()`
- `css['str']()`, `css['arr']()`
- `cssp.str()`, `cssp.arr()`

You can also pass options when using the `recommended()` function:

<<< @/.examples/integrations/eslint-recommended-with-options.mjs

::: info Default
By default, `fnName` is `'pika'`, which detects `pika()`, `pikap()`, `pika.str()`, `pika.arr()`, and their static bracket-access variants.
:::

## How It Works

The ESLint configuration package analyzes the Abstract Syntax Tree (AST) of your source code to detect calls to `pika()` (or variants like `pika.str()`, `pika['str']()`, `pikap()`, etc.). For each detected call:

1. **Traverse arguments**: The rule recursively inspects each argument node and its nested structure (object properties, array elements, spread operations).
2. **Check the literal subset**: For each value node, the rule verifies it matches one of the allowed static patterns (literal, object literal with static values, etc.).
3. **Report violations**: If a non-static expression is found, the rule reports an ESLint error with a specific message describing why that node falls outside the rule's static subset.

The package derives all function name variants automatically from the base `fnName` option:
- Normal: `pika`, `pika.str`, `pika.arr`
- Preview: `pikap`, `pikap.str`, `pikap.arr`
- Static bracket access: `pika['str']`, `pika['arr']`, and their preview equivalents

This ensures comprehensive coverage without manual configuration of each variant.

## Next

- [Build-Time Compile Principle](/principles/build-time-compile)
- [Vite Integration](/integrations/vite)
- [Integrations Overview](/integrations/overview)
