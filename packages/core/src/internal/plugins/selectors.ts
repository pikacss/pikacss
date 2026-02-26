import type { Engine } from '../engine'
import type { Arrayable, Awaitable, ResolvedSelector, UnionString } from '../types'
import { defineEnginePlugin } from '../plugin'
import { RecursiveResolver, resolveRuleConfig } from '../resolver'

// #region SelectorConfig
export type Selector
	= | string
		| [selector: RegExp, value: (matched: RegExpMatchArray) => Awaitable<Arrayable<UnionString | ResolvedSelector>>, autocomplete?: Arrayable<string>]
		| [selector: string, value: Arrayable<UnionString | ResolvedSelector>]
		| {
			selector: RegExp
			value: (matched: RegExpMatchArray) => Awaitable<Arrayable<UnionString | ResolvedSelector>>
			autocomplete?: Arrayable<string>
		}
		| {
			selector: string
			value: Arrayable<UnionString | ResolvedSelector>
		}

export interface SelectorsConfig {
	/**
	 * Define custom selectors with support for dynamic and static selectors.
	 *
	 * @default []
	 * @example
	 * ```ts
	 * {
	 *   selectors: [
	 *     // Static selector
	 *     ['hover', '$:hover'],
	 *     // Dynamic selector
	 *     [/^screen-(\d+)$/, m => `@media (min-width: ${m[1]}px)`,
	 *       ['screen-768', 'screen-1024']], // Autocomplete suggestions
	 *   ]
	 * }
	 * ```
	 */
	selectors: Selector[]
}
// #endregion SelectorConfig
declare module '@pikacss/core' {
	interface EngineConfig {
		selectors?: SelectorsConfig
	}

	interface Engine {
		selectors: {
			resolver: SelectorResolver
			add: (...list: Selector[]) => void
		}
	}
}

export function selectors() {
	let engine: Engine
	let configList: Selector[]
	return defineEnginePlugin({
		name: 'core:selectors',

		rawConfigConfigured(config) {
			configList = config.selectors?.selectors ?? []
		},
		configureEngine(_engine) {
			engine = _engine
			engine.selectors = {
				resolver: new SelectorResolver(),
				add: (...list: Selector[]) => {
					list.forEach((config) => {
						const resolved = resolveSelectorConfig(config)
						if (resolved == null)
							return

						if (typeof resolved === 'string') {
							engine.appendAutocompleteSelectors(resolved)
							return
						}

						if (resolved.type === 'static')
							engine.selectors.resolver.addStaticRule(resolved.rule)
						else if (resolved.type === 'dynamic')
							engine.selectors.resolver.addDynamicRule(resolved.rule)

						engine.appendAutocompleteSelectors(...resolved.autocomplete)
					})
				},
			}

			engine.selectors.add(...configList)

			engine.selectors.resolver.onResolved = (string, type) => {
				if (type === 'dynamic') {
					engine.appendAutocompleteSelectors(string)
				}
			}
		},
		async transformSelectors(selectors) {
			const result: string[] = []
			for (const selector of selectors) {
				result.push(...await engine.selectors.resolver.resolve(selector))
			}
			return result
		},
	})
}

class SelectorResolver extends RecursiveResolver<string> {}

export function resolveSelectorConfig(config: Selector) {
	return resolveRuleConfig<string>(config, 'selector')
}
