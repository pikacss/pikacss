import type { EngineConfig, EnginePlugin, Keyframes, KeyframesProgress, Preflight, Selector, Shortcut, StyleDefinition, VariablesDefinition } from '../../index'
import { describe, expectTypeOf, it } from 'vitest'
import { defineEngineConfig, defineEnginePlugin, defineKeyframes, definePreflight, defineSelector, defineShortcut, defineStyleDefinition, defineVariables } from '../../index'

describe('define functions', () => {
	describe('defineEngineConfig', () => {
		it('should return a type assignable to EngineConfig', () => {
			const config = defineEngineConfig({})
			expectTypeOf(config)
				.toExtend<EngineConfig>()
		})

		it('should preserve narrow return type with const generic', () => {
			const config = defineEngineConfig({ prefix: 'pika-' })
			expectTypeOf(config)
				.toExtend<EngineConfig>()
			expectTypeOf(config.prefix)
				.toEqualTypeOf<'pika-'>()
		})

		it('should accept full config with all fields', () => {
			const config = defineEngineConfig({
				plugins: [],
				prefix: 'pika-',
				defaultSelector: '.%',
				preflights: [],
				layers: { base: 0, utilities: 10 },
				defaultPreflightsLayer: 'preflights',
				defaultUtilitiesLayer: 'utilities',
			})
			expectTypeOf(config)
				.toExtend<EngineConfig>()
		})
	})

	describe('defineStyleDefinition', () => {
		it('should return a type assignable to StyleDefinition', () => {
			const def = defineStyleDefinition({ color: 'red' })
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
		})

		it('should accept nested style definition with selectors only', () => {
			const def = defineStyleDefinition({
				'$:hover': { color: 'blue' },
				'@media (min-width: 768px)': {
					fontSize: '20px',
				},
			})
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
		})

		it('should preserve literal property values with const generic', () => {
			const def = defineStyleDefinition({ color: 'red' })
			expectTypeOf(def)
				.toExtend<StyleDefinition>()
			expectTypeOf(def.color)
				.toEqualTypeOf<'red'>()
		})
	})

	describe('definePreflight', () => {
		it('should accept string preflight', () => {
			const p = definePreflight('* { box-sizing: border-box; }')
			expectTypeOf(p)
				.toExtend<Preflight>()
		})

		it('should return type assignable to Preflight for string input', () => {
			const p = definePreflight('* { box-sizing: border-box; }')
			expectTypeOf(p)
				.toExtend<Preflight>()
			expectTypeOf(p)
				.toEqualTypeOf<'* { box-sizing: border-box; }'>()
		})

		it('should accept PreflightDefinition object', () => {
			const p = definePreflight({
				'*': { boxSizing: 'border-box' },
				'body': { margin: '0' },
			})
			expectTypeOf(p)
				.toExtend<Preflight>()
		})

		it('should accept PreflightFn', () => {
			const p = definePreflight((_engine, isFormatted) => {
				expectTypeOf(isFormatted)
					.toEqualTypeOf<boolean>()
				return '* { margin: 0; }'
			})
			expectTypeOf(p)
				.toExtend<Preflight>()
		})

		it('should accept async PreflightFn', () => {
			const p = definePreflight(async (_engine, _isFormatted) => {
				return { body: { margin: '0' } }
			})
			expectTypeOf(p)
				.toExtend<Preflight>()
		})

		it('should accept WithLayer<string>', () => {
			const p = definePreflight({
				layer: 'base',
				preflight: '* { box-sizing: border-box; }',
			})
			expectTypeOf(p)
				.toExtend<Preflight>()
		})

		it('should accept WithLayer<PreflightDefinition>', () => {
			const p = definePreflight({
				layer: 'base',
				preflight: { body: { margin: '0' } },
			})
			expectTypeOf(p)
				.toExtend<Preflight>()
		})

		it('should accept WithLayer<PreflightFn>', () => {
			const p = definePreflight({
				layer: 'base',
				preflight: () => '* { margin: 0; }',
			})
			expectTypeOf(p)
				.toExtend<Preflight>()
		})
	})

	describe('defineKeyframes', () => {
		it('should accept string keyframes', () => {
			const k = defineKeyframes('fadeIn')
			expectTypeOf(k)
				.toExtend<Keyframes>()
		})

		it('should return type assignable to Keyframes for string input', () => {
			const k = defineKeyframes('fadeIn')
			expectTypeOf(k)
				.toExtend<Keyframes>()
			expectTypeOf(k)
				.toEqualTypeOf<'fadeIn'>()
		})

		it('should accept tuple [name]', () => {
			const k = defineKeyframes(['spin'])
			expectTypeOf(k)
				.toExtend<Keyframes>()
		})

		it('should accept tuple [name, frames]', () => {
			const k = defineKeyframes(['fadeIn', {
				from: { opacity: '0' },
				to: { opacity: '1' },
			}])
			expectTypeOf(k)
				.toExtend<Keyframes>()
		})

		it('should accept tuple [name, frames, autocomplete]', () => {
			const k = defineKeyframes(['fadeIn', {
				from: { opacity: '0' },
				to: { opacity: '1' },
			}, ['fadeIn 0.3s ease']])
			expectTypeOf(k)
				.toExtend<Keyframes>()
		})

		it('should accept tuple [name, frames, autocomplete, pruneUnused]', () => {
			const k = defineKeyframes(['fadeIn', {
				from: { opacity: '0' },
				to: { opacity: '1' },
			}, ['fadeIn 0.3s ease'], false])
			expectTypeOf(k)
				.toExtend<Keyframes>()
		})

		it('should accept object form', () => {
			const k = defineKeyframes({
				name: 'slideIn',
				frames: {
					'from': { transform: 'translateX(-100%)' },
					'to': { transform: 'translateX(0)' },
					'50%': { opacity: '0.5' },
				},
				autocomplete: ['slideIn 0.5s'],
				pruneUnused: true,
			})
			expectTypeOf(k)
				.toExtend<Keyframes>()
		})

		it('should accept percentage keys in KeyframesProgress', () => {
			const progress: KeyframesProgress = {
				'from': { opacity: '0' },
				'50%': { opacity: '0.5' },
				'to': { opacity: '1' },
			}
			expectTypeOf(progress)
				.toExtend<KeyframesProgress>()
		})
	})

	describe('defineSelector', () => {
		it('should accept string selector (autocomplete-only)', () => {
			const s = defineSelector('hover')
			expectTypeOf(s)
				.toExtend<Selector>()
		})

		it('should return type assignable to Selector for string input', () => {
			const s = defineSelector('hover')
			expectTypeOf(s)
				.toExtend<Selector>()
			expectTypeOf(s)
				.toEqualTypeOf<'hover'>()
		})

		it('should accept static tuple [string, value]', () => {
			const s = defineSelector(['hover', '$:hover'])
			expectTypeOf(s)
				.toExtend<Selector>()
		})

		it('should accept static tuple [string, array value]', () => {
			const s = defineSelector(['hover', ['$:hover', '$:focus']])
			expectTypeOf(s)
				.toExtend<Selector>()
		})

		it('should accept dynamic tuple [RegExp, fn]', () => {
			const s = defineSelector([/^screen-(\d+)$/, m => `@media (min-width: ${m[1]}px)`])
			expectTypeOf(s)
				.toExtend<Selector>()
		})

		it('should accept dynamic tuple [RegExp, fn, autocomplete]', () => {
			const s = defineSelector([/^screen-(\d+)$/, m => `@media (min-width: ${m[1]}px)`, ['screen-768', 'screen-1024']])
			expectTypeOf(s)
				.toExtend<Selector>()
		})

		it('should accept static object form', () => {
			const s = defineSelector({
				selector: 'hover',
				value: '$:hover',
			})
			expectTypeOf(s)
				.toExtend<Selector>()
		})

		it('should accept dynamic object form', () => {
			const s = defineSelector({
				selector: /^screen-(\d+)$/,
				value: m => `@media (min-width: ${m[1]}px)`,
				autocomplete: ['screen-768'],
			})
			expectTypeOf(s)
				.toExtend<Selector>()
		})
	})

	describe('defineShortcut', () => {
		it('should accept string shortcut (autocomplete-only)', () => {
			const s = defineShortcut('flex-center')
			expectTypeOf(s)
				.toExtend<Shortcut>()
		})

		it('should return type assignable to Shortcut for string input', () => {
			const s = defineShortcut('flex-center')
			expectTypeOf(s)
				.toExtend<Shortcut>()
			expectTypeOf(s)
				.toEqualTypeOf<'flex-center'>()
		})

		it('should accept static tuple [string, value]', () => {
			const s = defineShortcut(['flex-center', { display: 'flex', alignItems: 'center' }])
			expectTypeOf(s)
				.toExtend<Shortcut>()
		})

		it('should accept static tuple [string, array value]', () => {
			const s = defineShortcut(['flex-center', [{ display: 'flex' }, { alignItems: 'center' }]])
			expectTypeOf(s)
				.toExtend<Shortcut>()
		})

		it('should accept dynamic tuple [RegExp, fn]', () => {
			const s = defineShortcut([/^m-(\d+)$/, m => ({ margin: `${m[1]}px` })])
			expectTypeOf(s)
				.toExtend<Shortcut>()
		})

		it('should accept dynamic tuple [RegExp, fn, autocomplete]', () => {
			const s = defineShortcut([/^m-(\d+)$/, m => ({ margin: `${m[1]}px` }), ['m-4', 'm-8']])
			expectTypeOf(s)
				.toExtend<Shortcut>()
		})

		it('should accept static object form', () => {
			const s = defineShortcut({
				shortcut: 'flex-center',
				value: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
			})
			expectTypeOf(s)
				.toExtend<Shortcut>()
		})

		it('should accept dynamic object form', () => {
			const s = defineShortcut({
				shortcut: /^p-(\d+)$/,
				value: m => ({ padding: `${m[1]}px` }),
				autocomplete: ['p-4', 'p-8'],
			})
			expectTypeOf(s)
				.toExtend<Shortcut>()
		})
	})

	describe('defineVariables', () => {
		it('should accept flat variable definitions', () => {
			const v = defineVariables({
				'--color-bg': '#fff',
				'--color-text': '#000',
			})
			expectTypeOf(v)
				.toExtend<VariablesDefinition>()
		})

		it('should accept nested scoped definitions', () => {
			const v = defineVariables({
				'--color-bg': '#fff',
				'[data-theme="dark"]': {
					'--color-bg': '#000',
				},
			})
			expectTypeOf(v)
				.toExtend<VariablesDefinition>()
		})

		it('should accept null variable values (autocomplete-only)', () => {
			const v = defineVariables({
				'--external-var': null,
			})
			expectTypeOf(v)
				.toExtend<VariablesDefinition>()
		})

		it('should accept VariableObject form', () => {
			const v = defineVariables({
				'--color-primary': {
					value: 'blue',
					autocomplete: {
						asValueOf: ['color', 'background-color'],
						asProperty: true,
					},
					pruneUnused: false,
				},
			})
			expectTypeOf(v)
				.toExtend<VariablesDefinition>()
		})
	})

	describe('defineEnginePlugin', () => {
		it('should accept minimal plugin and return EnginePlugin', () => {
			const plugin = defineEnginePlugin({ name: 'test' })
			expectTypeOf(plugin)
				.toEqualTypeOf<EnginePlugin>()
		})

		it('should accept plugin with order', () => {
			const plugin = defineEnginePlugin({ name: 'test', order: 'pre' })
			expectTypeOf(plugin)
				.toEqualTypeOf<EnginePlugin>()
			const plugin2 = defineEnginePlugin({ name: 'test', order: 'post' })
			expectTypeOf(plugin2)
				.toEqualTypeOf<EnginePlugin>()
		})

		it('should infer configureRawConfig hook parameter as EngineConfig', () => {
			defineEnginePlugin({
				name: 'test',
				configureRawConfig(config) {
					expectTypeOf(config)
						.toEqualTypeOf<EngineConfig>()
				},
			})
		})

		it('should infer configureResolvedConfig hook parameter', () => {
			defineEnginePlugin({
				name: 'test',
				configureResolvedConfig(resolvedConfig) {
					expectTypeOf(resolvedConfig.prefix)
						.toEqualTypeOf<string>()
					expectTypeOf(resolvedConfig.plugins)
						.toEqualTypeOf<EnginePlugin[]>()
					expectTypeOf(resolvedConfig.layers)
						.toEqualTypeOf<Record<string, number>>()
				},
			})
		})

		it('should allow async hooks to return void or payload', () => {
			defineEnginePlugin({
				name: 'test',
				async configureRawConfig(_config) {
					// returning void is valid
				},
			})
			defineEnginePlugin({
				name: 'test',
				async configureRawConfig(config) {
					return { ...config, prefix: 'x-' }
				},
			})
		})

		it('should infer transformSelectors hook parameter as string[]', () => {
			defineEnginePlugin({
				name: 'test',
				transformSelectors(selectors) {
					expectTypeOf(selectors)
						.toEqualTypeOf<string[]>()
					return selectors
				},
			})
		})

		it('should infer preflightUpdated as sync void hook (no parameters)', () => {
			defineEnginePlugin({
				name: 'test',
				preflightUpdated() {
					// sync hook with no payload
				},
			})
		})

		it('should infer autocompleteConfigUpdated as sync void hook (no parameters)', () => {
			defineEnginePlugin({
				name: 'test',
				autocompleteConfigUpdated() {
					// sync hook with no payload
				},
			})
		})

		it('should reject plugin without name', () => {
			// @ts-expect-error name is required
			defineEnginePlugin({})
		})

		it('should reject invalid order value', () => {
			// @ts-expect-error 'middle' is not a valid order
			defineEnginePlugin({ name: 'x', order: 'middle' })
		})
	})
})
