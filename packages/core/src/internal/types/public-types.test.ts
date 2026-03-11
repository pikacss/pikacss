/* eslint-disable no-template-curly-in-string */
import type * as CSS from '../../csstype'
import type { AutocompleteContribution, AutocompletePatternsConfig, CSSProperty, CSSSelector, Engine, Properties, PropertyValue, Selector, StyleDefinition, StyleDefinitionMap, StyleItem } from '../../index'
import { describe, expectTypeOf, it } from 'vitest'

describe('public types - types.ts', () => {
	describe('autocompleteContribution', () => {
		it('should expose the stable appendAutocomplete payload type', () => {
			const contribution: AutocompleteContribution = {
				selectors: ['hover', 'focus'],
				styleItemStrings: 'flex-center',
				extraProperties: '__shortcut',
				cssProperties: {
					color: ['red', 'blue'],
				},
				patterns: {
					styleItemStrings: '`i-${string}:${string}`',
				},
			}

			expectTypeOf(contribution)
				.toExtend<AutocompleteContribution>()
		})

		it('should expose autocomplete pattern buckets as a separate public type', () => {
			const patterns: AutocompletePatternsConfig = {
				selectors: 'screen-${number}',
				styleItemStrings: ['`i-${string}:${string}`'],
				properties: {
					__icon: '`i-${string}:${string}`',
				},
			}

			expectTypeOf(patterns)
				.toExtend<AutocompletePatternsConfig>()
		})

		it('should expose engine.appendAutocomplete as the public mutation entry point', () => {
			expectTypeOf<Engine['appendAutocomplete']>()
				.toBeFunction()

			type AppendAutocompleteParams = Parameters<Engine['appendAutocomplete']>
			expectTypeOf<AppendAutocompleteParams>()
				.toEqualTypeOf<[AutocompleteContribution]>()
		})
	})

	describe('propertyValue', () => {
		it('should accept plain value', () => {
			expectTypeOf<'red'>()
				.toExtend<PropertyValue<string>>()
		})

		it('should accept null and undefined', () => {
			expectTypeOf<null>()
				.toExtend<PropertyValue<string>>()
			expectTypeOf<undefined>()
				.toExtend<PropertyValue<string>>()
		})

		it('should accept tuple with fallback', () => {
			const val: PropertyValue<string> = ['red', ['blue', 'green']]
			expectTypeOf(val)
				.toExtend<PropertyValue<string>>()
		})
	})

	describe('properties', () => {
		it('should keep generated CSS spec types narrower than the public authoring surface', () => {
			// @ts-expect-error generated spec types are intentionally closed by default
			const _specOnly: CSS.Properties['animationName'] = 'fade-in'
			// @ts-expect-error generated datatype families are also intentionally closed by default
			const _generatedColor: CSS.DataType.Color = 'brand-accent'

			const props: Properties = {
				animationName: 'fade-in',
				color: 'brand-accent',
			}
			expectTypeOf(props)
				.toExtend<Properties>()
		})

		it('should accept standard CSS properties in camelCase', () => {
			const props: Properties = {
				color: 'red',
				fontSize: '16px',
				backgroundColor: 'blue',
			}
			expectTypeOf(props)
				.toExtend<Properties>()
		})

		it('should accept standard CSS properties in kebab-case', () => {
			const props: Properties = {
				'color': 'red',
				'font-size': '16px',
				'background-color': 'blue',
			}
			expectTypeOf(props)
				.toExtend<Properties>()
		})

		it('should accept CSS custom properties', () => {
			const props: Properties = {
				'--my-color': 'red',
				'--spacing': '8px',
			}
			expectTypeOf(props)
				.toExtend<Properties>()
		})

		it('should accept nullish values', () => {
			const props: Properties = {
				color: null,
				fontSize: undefined,
			}
			expectTypeOf(props)
				.toExtend<Properties>()
		})

		it('should accept tuple fallback values', () => {
			const props: Properties = {
				color: ['red', ['blue']],
			}
			expectTypeOf(props)
				.toExtend<Properties>()
		})
	})

	describe('cSSProperty', () => {
		it('should include standard CSS properties', () => {
			expectTypeOf<'color'>()
				.toExtend<CSSProperty>()
			expectTypeOf<'fontSize'>()
				.toExtend<CSSProperty>()
			expectTypeOf<'font-size'>()
				.toExtend<CSSProperty>()
		})

		it('should include CSS custom properties', () => {
			expectTypeOf<'--my-var'>()
				.toExtend<CSSProperty>()
		})

		it('should not include arbitrary non-CSS strings', () => {
			// @ts-expect-error 'fooBarBaz' is not a valid CSS property name
			const _: CSSProperty = 'fooBarBaz'
		})
	})

	describe('cSSSelector', () => {
		it('should include pseudo selectors with $ prefix', () => {
			expectTypeOf<'$:hover'>()
				.toExtend<CSSSelector>()
			expectTypeOf<'$::before'>()
				.toExtend<CSSSelector>()
		})

		it('should include block at-rules', () => {
			expectTypeOf<'@media'>()
				.toExtend<CSSSelector>()
			expectTypeOf<'@supports'>()
				.toExtend<CSSSelector>()
		})

		it('should exclude non-block at-rules', () => {
			// @ts-expect-error @charset is not a block at-rule and must be excluded
			const _a: CSSSelector = '@charset'
			// @ts-expect-error @import is not a block at-rule and must be excluded
			const _b: CSSSelector = '@import'
			// @ts-expect-error @namespace is not a block at-rule and must be excluded
			const _c: CSSSelector = '@namespace'
		})
	})

	describe('selector', () => {
		it('should accept CSS selectors', () => {
			expectTypeOf<CSSSelector>()
				.toExtend<Selector>()
		})

		it('should accept arbitrary strings', () => {
			expectTypeOf<string>()
				.toExtend<Selector>()
		})
	})

	describe('styleDefinition', () => {
		it('should accept flat CSS properties', () => {
			const def: StyleDefinition = {
				color: 'red',
				fontSize: '16px',
			}
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
		})

		it('should accept nested style definitions with selectors', () => {
			const def: StyleDefinition = {
				'$:hover': {
					color: 'blue',
				},
				'@media (min-width: 768px)': {
					fontSize: '20px',
				},
			}
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
		})

		it('should accept StyleItem arrays in nested selectors', () => {
			const def: StyleDefinition = {
				'$:hover': [{ color: 'red' }],
			}
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
		})
	})

	describe('styleDefinitionMap', () => {
		it('should accept string keys with Properties values', () => {
			const map: StyleDefinitionMap = {
				'$:hover': { color: 'red' },
			}
			expectTypeOf(map)
				.toExtend<StyleDefinitionMap>()
		})

		it('should be the recursive branch of StyleDefinition', () => {
			expectTypeOf<StyleDefinitionMap>()
				.toExtend<StyleDefinition>()
		})
	})

	describe('styleItem', () => {
		it('should accept string', () => {
			expectTypeOf<string>()
				.toExtend<StyleItem>()
		})

		it('should accept StyleDefinition', () => {
			const item: StyleItem = { color: 'red' }
			expectTypeOf(item)
				.toExtend<StyleItem>()
		})
	})

	describe('properties - camelCase and kebab-case coexistence', () => {
		it('should accept mixed camelCase and kebab-case properties', () => {
			const props: Properties = {
				'color': 'red',
				'fontSize': '16px',
				'background-color': 'blue',
				'--my-var': '8px',
			}
			expectTypeOf(props)
				.toExtend<Properties>()
		})
	})

	describe('propertyValue - union type parameter', () => {
		it('should accept union value type directly', () => {
			expectTypeOf<'red' | 'blue'>()
				.toExtend<PropertyValue<'red' | 'blue' | 'green'>>()
		})

		it('should accept null/undefined for union parameter', () => {
			expectTypeOf<null>()
				.toExtend<PropertyValue<'a' | 'b'>>()
			expectTypeOf<undefined>()
				.toExtend<PropertyValue<'a' | 'b'>>()
		})

		it('should accept tuple for union parameter', () => {
			const val: PropertyValue<'a' | 'b'> = ['a', ['b']]
			expectTypeOf(val)
				.toExtend<PropertyValue<'a' | 'b'>>()
		})
	})

	describe('styleDefinition - deep nesting', () => {
		it('should accept deeply nested selectors', () => {
			const def: StyleDefinition = {
				'@media (min-width: 768px)': {
					'$:hover': {
						color: 'blue',
					},
				},
			}
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
		})

		it('should accept flat properties only', () => {
			const def: StyleDefinition = {
				color: 'red',
				fontSize: '16px',
			}
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
		})

		it('should accept nested selectors only', () => {
			const def: StyleDefinition = {
				'$:hover': {
					color: 'blue',
				},
				'@media (min-width: 768px)': {
					fontSize: '20px',
				},
			}
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
		})
	})

	describe('styleDefinitionMap - value types', () => {
		it('should accept Properties as values', () => {
			const map: StyleDefinitionMap = {
				'$:hover': { color: 'red', fontSize: '16px' },
			}
			expectTypeOf(map)
				.toExtend<StyleDefinitionMap>()
		})

		it('should accept nested StyleDefinition as values', () => {
			const map: StyleDefinitionMap = {
				'@media (min-width: 768px)': {
					'$:hover': { color: 'blue' },
				},
			}
			expectTypeOf(map)
				.toExtend<StyleDefinitionMap>()
		})

		it('should accept StyleItem array as values', () => {
			const map: StyleDefinitionMap = {
				'$:hover': [{ color: 'red' }, 'some-shortcut'],
			}
			expectTypeOf(map)
				.toExtend<StyleDefinitionMap>()
		})

		it('should accept undefined as values', () => {
			const map: StyleDefinitionMap = {
				'$:hover': undefined,
			}
			expectTypeOf(map)
				.toExtend<StyleDefinitionMap>()
		})
	})

	describe('styleItem - type narrowing', () => {
		it('should accept a string literal', () => {
			const item: StyleItem = 'some-shortcut'
			expectTypeOf(item)
				.toExtend<StyleItem>()
		})

		it('should accept a plain StyleDefinition object', () => {
			const item: StyleItem = { color: 'red', fontSize: '16px' }
			expectTypeOf(item)
				.toExtend<StyleItem>()
		})

		it('should accept a nested StyleDefinition object', () => {
			const item: StyleItem = {
				'$:hover': { color: 'blue' },
			}
			expectTypeOf(item)
				.toExtend<StyleItem>()
		})
	})
})
