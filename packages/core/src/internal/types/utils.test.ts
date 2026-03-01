import type { Arrayable, Awaitable, FromKebab, GetValue, IsEqual, IsNever, Nullish, ResolveFrom, Simplify, ToKebab, UnionString, UnionToIntersection } from './utils'
import { describe, expectTypeOf, it } from 'vitest'

describe('type utils', () => {
	describe('nullish', () => {
		it('should be null or undefined', () => {
			expectTypeOf<Nullish>()
				.toEqualTypeOf<null | undefined>()
		})
	})

	describe('unionString', () => {
		it('should be assignable from string literals but not equal to string', () => {
			expectTypeOf<'hello'>()
				.toMatchTypeOf<UnionString>()
			expectTypeOf<string>()
				.toMatchTypeOf<UnionString>()
			// UnionString = string & {}, which is intentionally NOT the same as plain string
			// This distinction preserves literal union autocomplete in IDE
			expectTypeOf<IsEqual<UnionString, string>>()
				.toEqualTypeOf<false>()
		})
	})

	describe('arrayable', () => {
		it('should accept single value or array', () => {
			expectTypeOf<'hello'>()
				.toMatchTypeOf<Arrayable<string>>()
			expectTypeOf<['hello']>()
				.toMatchTypeOf<Arrayable<string>>()
		})
	})

	describe('awaitable', () => {
		it('should accept value or promise', () => {
			expectTypeOf<string>()
				.toMatchTypeOf<Awaitable<string>>()
			expectTypeOf<Promise<string>>()
				.toMatchTypeOf<Awaitable<string>>()
		})
	})

	describe('unionToIntersection', () => {
		it('should convert union to intersection', () => {
			type Result = UnionToIntersection<{ a: 1 } | { b: 2 }>
			expectTypeOf<Result>()
				.toEqualTypeOf<{ a: 1 } & { b: 2 }>()
		})
	})

	describe('isEqual', () => {
		it('should return true for identical types', () => {
			expectTypeOf<IsEqual<string, string>>()
				.toEqualTypeOf<true>()
			expectTypeOf<IsEqual<1, 1>>()
				.toEqualTypeOf<true>()
		})

		it('should return false for different types', () => {
			expectTypeOf<IsEqual<string, number>>()
				.toEqualTypeOf<false>()
			expectTypeOf<IsEqual<string, string | number>>()
				.toEqualTypeOf<false>()
		})
	})

	describe('isNever', () => {
		it('should return true for never', () => {
			expectTypeOf<IsNever<never>>()
				.toEqualTypeOf<true>()
		})

		it('should return false for non-never', () => {
			expectTypeOf<IsNever<string>>()
				.toEqualTypeOf<false>()
			expectTypeOf<IsNever<undefined>>()
				.toEqualTypeOf<false>()
		})
	})

	describe('simplify', () => {
		it('should flatten intersection types', () => {
			type Input = { a: 1 } & { b: 2 }
			type Result = Simplify<Input>
			expectTypeOf<Result>()
				.toEqualTypeOf<{ a: 1, b: 2 }>()
		})
	})

	describe('toKebab', () => {
		it('should convert camelCase to kebab-case', () => {
			expectTypeOf<ToKebab<'fontSize'>>()
				.toEqualTypeOf<'font-size'>()
			expectTypeOf<ToKebab<'backgroundColor'>>()
				.toEqualTypeOf<'background-color'>()
			expectTypeOf<ToKebab<'borderTopLeftRadius'>>()
				.toEqualTypeOf<'border-top-left-radius'>()
		})

		it('should leave already kebab strings unchanged', () => {
			expectTypeOf<ToKebab<'font-size'>>()
				.toEqualTypeOf<'font-size'>()
		})

		it('should leave lowercase strings unchanged', () => {
			expectTypeOf<ToKebab<'color'>>()
				.toEqualTypeOf<'color'>()
		})

		it('should handle CSS custom property strings (pass-through)', () => {
			// CSS custom properties start with '--'. ToKebab should handle them.
			// Document the actual behavior so regressions are detected.
			type Result = ToKebab<'--my-var'>
			// If this resolves to string (TypeScript recursion depth limit), the test will fail,
			// alerting us that the implementation has a recursion issue for '--' prefixed strings.
			expectTypeOf<Result>()
				.not.toEqualTypeOf<string>()
		})
	})

	describe('fromKebab', () => {
		it('should convert kebab-case to camelCase', () => {
			expectTypeOf<FromKebab<'font-size'>>()
				.toEqualTypeOf<'fontSize'>()
			expectTypeOf<FromKebab<'background-color'>>()
				.toEqualTypeOf<'backgroundColor'>()
			expectTypeOf<FromKebab<'border-top-left-radius'>>()
				.toEqualTypeOf<'borderTopLeftRadius'>()
		})

		it('should preserve CSS custom properties', () => {
			expectTypeOf<FromKebab<'--my-var'>>()
				.toEqualTypeOf<'--my-var'>()
			expectTypeOf<FromKebab<'--color-primary'>>()
				.toEqualTypeOf<'--color-primary'>()
		})

		it('should leave camelCase unchanged', () => {
			expectTypeOf<FromKebab<'fontSize'>>()
				.toEqualTypeOf<'fontSize'>()
		})
	})

	describe('getValue', () => {
		it('should extract value from known key', () => {
			interface Obj { a: string, b: number }
			expectTypeOf<GetValue<Obj, 'a'>>()
				.toEqualTypeOf<string>()
			expectTypeOf<GetValue<Obj, 'b'>>()
				.toEqualTypeOf<number>()
		})

		it('should return never for never type', () => {
			expectTypeOf<GetValue<never, 'a'>>()
				.toEqualTypeOf<never>()
		})

		it('should return never for unknown key', () => {
			interface Obj { a: string }
			expectTypeOf<GetValue<Obj, 'b'>>()
				.toEqualTypeOf<never>()
		})

		it('should work with Record types', () => {
			type Obj = Record<string, number>
			expectTypeOf<GetValue<Obj, 'anything'>>()
				.toEqualTypeOf<number>()
		})
	})

	describe('resolveFrom', () => {
		it('should resolve from interface if key exists', () => {
			interface Obj { Foo: string }
			expectTypeOf<ResolveFrom<Obj, 'Foo', string, 'default'>>()
				.toEqualTypeOf<string>()
		})

		it('should return fallback if key does not exist', () => {
			interface Obj { Bar: string }
			expectTypeOf<ResolveFrom<Obj, 'Foo', string, 'default'>>()
				.toEqualTypeOf<'default'>()
		})

		it('should return fallback if value type does not match interface', () => {
			interface Obj { Foo: number }
			expectTypeOf<ResolveFrom<Obj, 'Foo', string, 'fallback'>>()
				.toEqualTypeOf<'fallback'>()
		})

		it('should return fallback for empty interface', () => {
			interface Empty {}
			expectTypeOf<ResolveFrom<Empty, 'Missing', string, 'fallback'>>()
				.toEqualTypeOf<'fallback'>()
		})
	})

	describe('toKebab - edge cases', () => {
		it('should handle consecutive capitals (acronym-like)', () => {
			expectTypeOf<ToKebab<'getHTMLElement'>>()
				.toEqualTypeOf<'get-h-t-m-l-element'>()
		})

		it('should handle vendor-prefix-like names', () => {
			expectTypeOf<ToKebab<'WebkitTransform'>>()
				.toEqualTypeOf<'webkit-transform'>()
			expectTypeOf<ToKebab<'MozAppearance'>>()
				.toEqualTypeOf<'moz-appearance'>()
		})

		it('should handle long property names', () => {
			expectTypeOf<ToKebab<'animationIterationCount'>>()
				.toEqualTypeOf<'animation-iteration-count'>()
			expectTypeOf<ToKebab<'borderBlockEndStyle'>>()
				.toEqualTypeOf<'border-block-end-style'>()
		})

		it('should handle single character', () => {
			expectTypeOf<ToKebab<'A'>>()
				.toEqualTypeOf<'a'>()
			expectTypeOf<ToKebab<'a'>>()
				.toEqualTypeOf<'a'>()
		})

		it('should handle empty string', () => {
			expectTypeOf<ToKebab<''>>()
				.toEqualTypeOf<''>()
		})
	})

	describe('fromKebab - edge cases', () => {
		it('should preserve CSS custom properties with multiple dashes', () => {
			expectTypeOf<FromKebab<'--my-deeply-nested-var'>>()
				.toEqualTypeOf<'--my-deeply-nested-var'>()
		})

		it('should preserve CSS custom property with single name', () => {
			expectTypeOf<FromKebab<'--x'>>()
				.toEqualTypeOf<'--x'>()
		})

		it('should handle single segment (no dashes)', () => {
			expectTypeOf<FromKebab<'color'>>()
				.toEqualTypeOf<'color'>()
		})

		it('should handle empty string', () => {
			expectTypeOf<FromKebab<''>>()
				.toEqualTypeOf<''>()
		})
	})

	describe('getValue - edge cases', () => {
		it('should work with generic Record<string, T>', () => {
			type Obj = Record<string, boolean>
			expectTypeOf<GetValue<Obj, 'x'>>()
				.toEqualTypeOf<boolean>()
		})

		it('should distribute over union keys', () => {
			interface Obj { a: string, b: number }
			expectTypeOf<GetValue<Obj, 'a' | 'b'>>()
				.toEqualTypeOf<string | number>()
		})

		it('should return never for union where some keys miss', () => {
			interface Obj { a: string }
			// 'b' is not in Obj, so GetValue<Obj, 'b'> = never
			// union: string | never = string
			expectTypeOf<GetValue<Obj, 'a' | 'b'>>()
				.toEqualTypeOf<string>()
		})
	})
})
