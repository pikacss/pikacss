import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import rule from '../../src/rules/no-dynamic-args'

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
})

describe('no-dynamic-args', () => {
	it('should validate static vs dynamic arguments in pika() calls', () => {
		ruleTester.run('no-dynamic-args', rule, {
			valid: [
				// ===== VALID: Static literal arguments =====

				// Simple string argument
				`pika('color-red')`,

				// Object with static values
				`pika({ color: 'red' })`,

				// Multiple static arguments
				`pika({ color: 'red' }, { fontSize: '16px' })`,

				// Nested static objects (selectors)
				`pika({ color: 'black', '&:hover': { color: 'blue' } })`,

				// Number values
				`pika({ fontSize: 16 })`,

				// Negative number values
				`pika({ zIndex: -1 })`,

				// Boolean values (technically literals)
				// NOTE: not a valid PikaCSS value, but syntactically static
				// `pika({ display: true })`, — removed since booleans may not pass

				// Template literal without expressions
				'pika({ color: `red` })',

				// Null value
				`pika({ color: null })`,

				// Empty object
				`pika({})`,

				// Empty call
				`pika()`,

				// String variant
				`pika.str({ color: 'red' })`,

				// String variant with bracket access
				`pika['str']({ color: 'red' })`,

				// Array variant with template literal property access
				'pika[`arr`]({ color: \'red\' })',

				// Array variant
				`pika.arr({ color: 'red' })`,

				// Preview variant
				`pikap({ color: 'red' })`,

				// Preview string variant
				`pikap.str({ color: 'red' })`,

				// Preview array variant
				`pikap.arr({ color: 'red' })`,

				// Spread of static object literal
				`pika({ ...{ color: 'red' } })`,

				// Array with static elements
				`pika(['color-red', 'font-bold'])`,

				// Deeply nested static object
				`pika({ '@media (max-width: 768px)': { '&:hover': { color: 'blue' } } })`,

				// Not a pika call — should be ignored
				`someOtherFunction(dynamicVar)`,

			],

			invalid: [
				// ===== INVALID: Variable reference =====
				{
					code: `const color = 'red'; pika({ color: color })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Variable as argument =====
				{
					code: `const styles = { color: 'red' }; pika(styles)`,
					errors: [{ messageId: 'noDynamicArg' }],
				},

				// ===== INVALID: Function call in value =====
				{
					code: `pika({ color: getColor() })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Template literal with expression =====
				{
					// eslint-disable-next-line no-template-curly-in-string
					code: 'const size = 16; pika({ fontSize: `${size}px` })',
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Spread of variable =====
				{
					code: `const base = { color: 'red' }; pika({ ...base })`,
					errors: [{ messageId: 'noDynamicSpread' }],
				},

				// ===== INVALID: Conditional expression =====
				{
					code: `const isDark = true; pika({ color: isDark ? 'white' : 'black' })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Binary expression =====
				{
					code: `const x = 10; pika({ width: x + 'px' })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Member expression =====
				{
					code: `const theme = { color: 'red' }; pika({ color: theme.color })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Dynamic computed key =====
				{
					code: `const key = 'color'; pika({ [key]: 'red' })`,
					errors: [{ messageId: 'noDynamicComputedKey' }],
				},

				// ===== INVALID: pika.str variant =====
				{
					code: `pika.str({ color: getColor() })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: pika['str'] variant =====
				{
					code: `pika['str']({ color: getColor() })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: pikap variant =====
				{
					code: `pikap({ color: someVar })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: pikap.arr variant =====
				{
					code: `pikap.arr({ color: someVar })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Nested non-static value =====
				{
					code: `pika({ '&:hover': { color: someVar } })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Spread as top-level argument =====
				{
					code: `const s = { color: 'red' }; pika(...s)`,
					errors: [{ messageId: 'noDynamicSpread' }],
				},

				// ===== INVALID: Multiple errors in one call =====
				{
					code: `pika({ color: someVar, fontSize: getSize() })`,
					errors: [
						{ messageId: 'noDynamicProperty' },
						{ messageId: 'noDynamicProperty' },
					],
				},

				// ===== INVALID: Array with dynamic element =====
				{
					code: `pika([someVar])`,
					errors: [{ messageId: 'noDynamicArg' }],
				},

				// ===== INVALID: New expression =====
				{
					code: `pika({ color: new Color('red') })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// ===== INVALID: Tagged template =====
				{
					code: `pika({ color: css\`red\` })`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},
			],
		})
	})

	it('should work with custom function names', () => {
		ruleTester.run('no-dynamic-args', rule, {
			valid: [
				{
					code: `css({ color: 'red' })`,
					options: [{ fnName: 'css' }],
				},
				{
					code: `css.str({ color: 'red' })`,
					options: [{ fnName: 'css' }],
				},
				{
					code: `css['str']({ color: 'red' })`,
					options: [{ fnName: 'css' }],
				},
				{
					code: `cssp({ color: 'red' })`,
					options: [{ fnName: 'css' }],
				},
				{
					code: `cssp.arr({ color: 'red' })`,
					options: [{ fnName: 'css' }],
				},
				// Default pika should be ignored when custom name is set
				{
					code: `pika(someVar)`,
					options: [{ fnName: 'css' }],
				},
			],
			invalid: [
				{
					code: `css({ color: someVar })`,
					options: [{ fnName: 'css' }],
					errors: [{ messageId: 'noDynamicProperty' }],
				},
				{
					code: `cssp({ color: someVar })`,
					options: [{ fnName: 'css' }],
					errors: [{ messageId: 'noDynamicProperty' }],
				},
				{
					code: `css.str({ color: someVar })`,
					options: [{ fnName: 'css' }],
					errors: [{ messageId: 'noDynamicProperty' }],
				},
				{
					code: `css['str']({ color: someVar })`,
					options: [{ fnName: 'css' }],
					errors: [{ messageId: 'noDynamicProperty' }],
				},
			],
		})
	})
})
