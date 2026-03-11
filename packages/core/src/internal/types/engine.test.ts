/* eslint-disable no-template-curly-in-string */
import type { Engine } from '../engine'
import type { EnginePlugin } from '../plugin'
import type { AutocompleteConfig, AutocompleteContribution, ResolvedAutocompleteConfig } from './autocomplete'
import type { EngineConfig, ResolvedEngineConfig } from './engine'
import type { ResolvedPreflight } from './preflight'
import type { AtomicStyle } from './shared'
import { describe, expectTypeOf, it } from 'vitest'

describe('engine types', () => {
	describe('engineConfig', () => {
		it('should have all optional fields', () => {
			const empty: EngineConfig = {}
			expectTypeOf(empty)
				.toMatchTypeOf<EngineConfig>()
		})

		it('should accept full config', () => {
			const config: EngineConfig = {
				plugins: [],
				prefix: 'pika-',
				defaultSelector: '.%',
				preflights: [],
				layers: { base: 0, utilities: 10 },
				defaultPreflightsLayer: 'preflights',
				defaultUtilitiesLayer: 'utilities',
				autocomplete: {
					styleItemStrings: ['btn-primary'],
					patterns: {
						selectors: ['screen-${number}'],
					},
				},
			}
			expectTypeOf(config)
				.toMatchTypeOf<EngineConfig>()
		})

		it('should expose autocomplete config input type', () => {
			expectTypeOf<EngineConfig['autocomplete']>()
				.toEqualTypeOf<AutocompleteConfig | undefined>()
		})
	})

	describe('resolvedEngineConfig', () => {
		it('should have all required fields', () => {
			expectTypeOf<ResolvedEngineConfig['prefix']>()
				.toEqualTypeOf<string>()
			expectTypeOf<ResolvedEngineConfig['defaultSelector']>()
				.toEqualTypeOf<string>()
			expectTypeOf<ResolvedEngineConfig['plugins']>()
				.toEqualTypeOf<EnginePlugin[]>()
			expectTypeOf<ResolvedEngineConfig['preflights']>()
				.toEqualTypeOf<ResolvedPreflight[]>()
			expectTypeOf<ResolvedEngineConfig['autocomplete']>()
				.toEqualTypeOf<ResolvedAutocompleteConfig>()
			expectTypeOf<ResolvedEngineConfig['layers']>()
				.toEqualTypeOf<Record<string, number>>()
			expectTypeOf<ResolvedEngineConfig['defaultPreflightsLayer']>()
				.toEqualTypeOf<string>()
			expectTypeOf<ResolvedEngineConfig['defaultUtilitiesLayer']>()
				.toEqualTypeOf<string>()
		})
	})

	describe('enginePlugin', () => {
		it('should require name', () => {
			const plugin: EnginePlugin = { name: 'test' }
			expectTypeOf(plugin)
				.toMatchTypeOf<EnginePlugin>()
		})

		it('should accept optional order', () => {
			const plugin: EnginePlugin = { name: 'test', order: 'pre' }
			expectTypeOf(plugin.order)
				.toMatchTypeOf<'pre' | 'post' | undefined>()
		})

		it('should accept hook functions', () => {
			const plugin: EnginePlugin = {
				name: 'test',
				configureRawConfig(config) {
					expectTypeOf(config)
						.toEqualTypeOf<EngineConfig>()
					return config
				},
				configureResolvedConfig(resolvedConfig) {
					expectTypeOf(resolvedConfig)
						.toEqualTypeOf<ResolvedEngineConfig>()
					return resolvedConfig
				},
				configureEngine(engine) {
					expectTypeOf(engine)
						.toEqualTypeOf<Engine>()
					return engine
				},
			}
			expectTypeOf(plugin)
				.toMatchTypeOf<EnginePlugin>()
		})
	})

	describe('engine class', () => {
		it('should have config property', () => {
			expectTypeOf<Engine['config']>()
				.toEqualTypeOf<ResolvedEngineConfig>()
		})

		it('should have use method that returns string array promise', () => {
			expectTypeOf<Engine['use']>()
				.toBeFunction()
			// use returns Promise<string[]>
			type UseReturn = ReturnType<Engine['use']>
			expectTypeOf<UseReturn>()
				.toEqualTypeOf<Promise<string[]>>()
		})

		it('should have render methods', () => {
			expectTypeOf<Engine['renderPreflights']>()
				.toBeFunction()
			expectTypeOf<Engine['renderAtomicStyles']>()
				.toBeFunction()
			expectTypeOf<Engine['renderLayerOrderDeclaration']>()
				.toBeFunction()
		})

		it('should expose appendAutocomplete with the public contribution type', () => {
			expectTypeOf<Engine['appendAutocomplete']>()
				.toBeFunction()

			type AppendAutocompleteParams = Parameters<Engine['appendAutocomplete']>
			expectTypeOf<AppendAutocompleteParams>()
				.toEqualTypeOf<[AutocompleteContribution]>()
		})
	})

	describe('enginePlugin - hook inference', () => {
		it('should infer rawConfigConfigured as sync void hook', () => {
			const plugin: EnginePlugin = {
				name: 'test',
				rawConfigConfigured(config) {
					expectTypeOf(config)
						.toEqualTypeOf<EngineConfig>()
				},
			}
			expectTypeOf(plugin)
				.toMatchTypeOf<EnginePlugin>()
		})

		it('should infer transformStyleItems hook parameter as array', () => {
			const plugin: EnginePlugin = {
				name: 'test',
				transformStyleItems(styleItems) {
					expectTypeOf(styleItems)
						.toBeArray()
				},
			}
			expectTypeOf(plugin)
				.toMatchTypeOf<EnginePlugin>()
		})

		it('should infer transformStyleDefinitions hook parameter as array', () => {
			const plugin: EnginePlugin = {
				name: 'test',
				transformStyleDefinitions(styleDefinitions) {
					expectTypeOf(styleDefinitions)
						.toBeArray()
				},
			}
			expectTypeOf(plugin)
				.toMatchTypeOf<EnginePlugin>()
		})

		it('should infer atomicStyleAdded as sync hook with AtomicStyle', () => {
			const plugin: EnginePlugin = {
				name: 'test',
				atomicStyleAdded(atomicStyle) {
					expectTypeOf(atomicStyle)
						.toHaveProperty('id')
					expectTypeOf(atomicStyle)
						.toHaveProperty('content')
					expectTypeOf(atomicStyle)
						.toEqualTypeOf<AtomicStyle>()
				},
			}
			expectTypeOf(plugin)
				.toMatchTypeOf<EnginePlugin>()
		})

		it('should accept a plugin with all hooks defined', () => {
			const plugin: EnginePlugin = {
				name: 'full-hooks',
				order: 'pre',
				configureRawConfig(config) { return config },
				rawConfigConfigured(_config) {},
				configureResolvedConfig(resolvedConfig) { return resolvedConfig },
				configureEngine(engine) { return engine },
				transformSelectors(selectors) { return selectors },
				transformStyleItems(items) { return items },
				transformStyleDefinitions(defs) { return defs },
				preflightUpdated() {},
				atomicStyleAdded(_atomicStyle) {},
				autocompleteConfigUpdated() {},
			}
			expectTypeOf(plugin)
				.toMatchTypeOf<EnginePlugin>()
		})
	})
})
