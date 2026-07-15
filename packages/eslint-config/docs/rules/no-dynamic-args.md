# `pikacss/no-dynamic-args`

> Disallow arguments to PikaCSS macro calls that the build-time compiler cannot statically evaluate.

PikaCSS resolves `pika()` (and its `.str`, `.arr`, and preview `pikap()` variants) at build time by statically evaluating the call arguments. An argument the compiler cannot evaluate produces no styles. This rule flags those arguments in your editor instead of letting them fail silently during the build.

The rule is **aligned with the compiler's evaluator**: it accepts exactly what the transform accepts, so it never flags a call the build would have handled, and never green-lights one the build would drop.

## Accepted (static) arguments

- String / number / boolean / `null` literals
- Objects and arrays composed recursively of accepted values (including spreads of static objects/arrays and static computed keys)
- Template literals whose interpolated expressions are all static (e.g. `` `x-${1}` ``)
- Unary `-`, `+`, `!`, `void` on a static operand
- Binary `+`, `-`, `*`, `/`, `===`, `!==` with static operands
- Logical `&&`, `||`, `??` with static operands
- Conditional `cond ? a : b` when all three are static
- The global constants `undefined`, `NaN`, `Infinity` — unless shadowed by a local binding

## Reported (dynamic) arguments

Anything else: bare identifiers/variables, member expressions, function/`new`/tagged-template calls, `await`/`yield`, assignments, sequences, unsupported operators (bitwise, `%`, `**`, `==`, `!=`), and any operator expression with a non-static operand.

Examples of **correct** code:

```ts
pika({ color: 'red' })
pika(`p-${2}`) // static template expression
pika(true ? 'a' : 'b') // static test and branches
```

Examples of **incorrect** code:

```ts
/* eslint-disable pikacss/no-dynamic-args */
pika(color) // variable reference
pika({ color: theme.primary }) // member expression
pika(`p-${size}`) // dynamic template expression
```

## Scope awareness

A call whose callee **root** is a local binding — an import, variable, parameter, or function/class declaration — is skipped: it is your own function, not a PikaCSS macro. This mirrors the transformer's scope-based shadowing.

```ts
const pika = (v: string) => v
pika(dynamic) // not reported — your `pika`, not the macro
```

## Options

```jsonc
{
	"pikacss/no-dynamic-args": ["error", { "fnName": "pika" }]
}
```

- `fnName` (string, default `"pika"`) — the base macro name. The `.str`/`.arr` and preview (`<fnName>p`) variants are derived automatically.
