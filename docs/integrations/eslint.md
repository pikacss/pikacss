# ESLint Configuration

PikaCSS provides an ESLint configuration package that enforces build-time constraints on `pika()` function calls. It ensures all arguments are **statically analyzable** — preventing runtime values, variables, or dynamic expressions that would break PikaCSS's build-time compilation.

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

This automatically applies the `pikacss/no-dynamic-args: 'error'` rule, which validates that all `pika()` calls use only static, build-time evaluatable arguments.

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

**Disallows dynamic (non-static) arguments in PikaCSS function calls.**

PikaCSS evaluates all `pika()` arguments at build time using `new Function('return ...')`. This means arguments must be **statically analyzable** — only literal values, object/array literals with static values, and static spreads are allowed.

**Valid** (static):

<<< @/.examples/integrations/eslint-valid-example.ts

**Invalid** (dynamic):

<<< @/.examples/integrations/eslint-invalid-example.ts

**Error output example:**

<<< @/.examples/integrations/eslint-error-output.txt

### What is "Statically Analyzable"?

An expression is statically analyzable if it can be evaluated at build time without executing application runtime code. This includes:

- **Literals**: `'red'`, `16`, `-1`, `null`, `` `red` ``
- **Object literals**: `{ color: 'red', fontSize: 16 }`
- **Array literals**: `['color-red', 'font-bold']`
- **Nested structures**: `{ '&:hover': { color: 'blue' } }`
- **Static spreads**: `{ ...{ color: 'red' } }` (spread of a static object literal)
- **Unary expressions**: `-1`, `+2`

These are **NOT** statically analyzable:

- **Variables**: `pika({ color: myColor })`
- **Function calls**: `pika({ color: getColor() })`
- **Template literals with expressions**: `` pika({ fontSize: `${size}px` }) ``
- **Conditionals**: `pika({ color: isDark ? 'white' : 'black' })`
- **Member access**: `pika({ color: theme.primary })`
- **Binary/logical expressions**: `pika({ width: x + 10 })`
- **Dynamic spreads**: `pika({ ...baseStyles })`
- **Dynamic computed keys**: `pika({ [key]: 'value' })`

::: tip Why This Restriction?
PikaCSS compiles styles at build time, not runtime. All values must be known during bundling so the engine can extract and generate atomic CSS classes. See [Build-Time Compile](/principles/build-time-compile) for conceptual details.
:::

## Configuration

### `fnName`

Customize the function name to detect if `pika` conflicts with another identifier in your project:

<<< @/.examples/integrations/eslint-custom-fnname.mjs

When `fnName` is set to `'css'`, the rule will detect:

- `css()`, `cssp()`
- `css.str()`, `css.arr()`, `css.inl()`
- `cssp.str()`, `cssp.arr()`, `cssp.inl()`

You can also pass options when using the `recommended()` function:

<<< @/.examples/integrations/eslint-recommended-with-options.mjs

::: info Default
By default, `fnName` is `'pika'`, which detects `pika()`, `pikap()`, `pika.str()`, `pika.arr()`, `pika.inl()`, and preview variants.
:::

## How It Works

The ESLint configuration package analyzes the Abstract Syntax Tree (AST) of your source code to detect calls to `pika()` (or variants like `pika.str()`, `pikap()`, etc.). For each detected call:

1. **Traverse arguments**: The rule recursively inspects each argument node and its nested structure (object properties, array elements, spread operations).
2. **Check static constraints**: For each value node, the rule verifies it matches one of the allowed static patterns (literal, object literal with static values, etc.).
3. **Report violations**: If a non-static expression is found, the rule reports an ESLint error with a specific message describing why the value is not statically analyzable.

The package derives all function name variants automatically from the base `fnName` option:
- Normal: `pika`, `pika.str`, `pika.arr`, `pika.inl`
- Preview: `pikap`, `pikap.str`, `pikap.arr`, `pikap.inl`

This ensures comprehensive coverage without manual configuration of each variant.

## Next

- [Build-Time Compile Principle](/principles/build-time-compile)
- [Vite Integration](/integrations/vite)
- [Integrations Overview](/integrations/overview)
