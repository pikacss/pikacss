import type { Engine } from '../engine'
import type { Arrayable, Awaitable, InternalStyleDefinition, InternalStyleItem, ResolvedStyleItem } from '../types'
import { defineEnginePlugin } from '../plugin'
import { RecursiveResolver, resolveRuleConfig } from '../resolver'
import { isNotString } from '../utils'

// #region ShortcutConfig
export type Shortcut
	= | string
		| [shortcut: RegExp, value: (matched: RegExpMatchArray) => Awaitable<Arrayable<ResolvedStyleItem>>, autocomplete?: Arrayable<string>]
		| {
			shortcut: RegExp
			value: (matched: RegExpMatchArray) => Awaitable<Arrayable<ResolvedStyleItem>>
			autocomplete?: Arrayable<string>
		}
		| [shortcut: string, value: Arrayable<ResolvedStyleItem>]
		| {
			shortcut: string
			value: Arrayable<ResolvedStyleItem>
		}

export interface ShortcutsConfig {
	/**
	 * Define style shortcuts for reusable style combinations.
	 *
	 * @default []
	 * @example
	 * ```ts
	 * {
	 *   shortcuts: [
	 *     // Static shortcut
	 *     ['flex-center', {
	 *       display: 'flex',
	 *       alignItems: 'center',
	 *       justifyContent: 'center'
	 *     }],
	 *     // Dynamic shortcut
	 *     [/^m-(\d+)$/, m => ({ margin: `${m[1]}px` }),
	 *       ['m-4', 'm-8']] // Autocomplete suggestions
	 *   ]
	 * }
	 * ```
	 */
	shortcuts: Shortcut[]
}
// #endregion ShortcutConfig

declare module '@pikacss/core' {
	interface EngineConfig {
		shortcuts?: ShortcutsConfig
	}

	interface Engine {
		shortcuts: {
			resolver: ShortcutResolver
			add: (...list: Shortcut[]) => void
		}
	}
}

export function shortcuts() {
	let engine: Engine
	let configList: Shortcut[]
	return defineEnginePlugin({
		name: 'core:shortcuts',

		rawConfigConfigured(config) {
			configList = config.shortcuts?.shortcuts ?? []
		},
		configureEngine(_engine) {
			engine = _engine
			engine.shortcuts = {
				resolver: new ShortcutResolver(),
				add: (...list) => {
					list.forEach((config) => {
						const resolved = resolveShortcutConfig(config)
						if (resolved == null)
							return

						if (typeof resolved === 'string') {
							engine.appendAutocomplete({ styleItemStrings: resolved })
							return
						}

						if (resolved.type === 'static')
							engine.shortcuts.resolver.addStaticRule(resolved.rule)
						else if (resolved.type === 'dynamic')
							engine.shortcuts.resolver.addDynamicRule(resolved.rule)

						engine.appendAutocomplete({ styleItemStrings: resolved.autocomplete })
					})
				},
			}

			engine.shortcuts.add(...configList)

			engine.shortcuts.resolver.onResolved = (string, type) => {
				if (type === 'dynamic') {
					engine.appendAutocomplete({ styleItemStrings: string })
				}
			}

			const unionType = ['(string & {})', 'Autocomplete[\'StyleItemString\']'].join(' | ')
			engine.appendAutocomplete({
				extraProperties: '__shortcut',
				properties: {
					__shortcut: [unionType, `(${unionType})[]`],
				},
			})
		},
		async transformStyleItems(styleItems) {
			const result: InternalStyleItem[] = []
			for (const styleItem of styleItems) {
				if (typeof styleItem === 'string') {
					result.push(...await engine.shortcuts.resolver.resolve(styleItem))
					continue
				}

				result.push(styleItem)
			}
			return result
		},
		async transformStyleDefinitions(styleDefinitions) {
			const result: InternalStyleDefinition[] = []
			for (const styleDefinition of styleDefinitions) {
				if ('__shortcut' in styleDefinition) {
					const { __shortcut, ...rest } = styleDefinition as InternalStyleDefinition & { __shortcut?: unknown }
					const applied: InternalStyleDefinition[] = []
					for (const shortcut of ((__shortcut == null ? [] : [__shortcut].flat(1)) as string[])) {
						const resolved: InternalStyleDefinition[] = (await engine.shortcuts.resolver.resolve(shortcut)).filter(isNotString)
						applied.push(...resolved)
					}
					result.push(...applied, rest)
				}
				else {
					result.push(styleDefinition)
				}
			}
			return result
		},
	})
}

class ShortcutResolver extends RecursiveResolver<InternalStyleItem> {}

function resolveShortcutConfig(config: Shortcut) {
	return resolveRuleConfig<InternalStyleItem>(config, 'shortcut')
}
