import type { Arrayable, InternalPropertyValue, PreflightDefinition, ResolvedCSSProperties, ResolvedSelector, UnionString } from '../types'
import { defineEnginePlugin } from '../plugin'

type ResolvedCSSProperty = keyof ResolvedCSSProperties
type ResolvedCSSVarProperty = ResolvedCSSProperty extends infer T ? T extends `--${string}` ? T : never : never

export interface VariableAutocomplete {
	/**
	 * Specify the properties that the variable can be used as a value of.
	 *
	 * @default ['*']
	 */
	asValueOf?: Arrayable<UnionString | '*' | '-' | ResolvedCSSProperty>
	/**
	 * Whether to add the variable as a CSS property.
	 *
	 * @default true
	 */
	asProperty?: boolean
}

export interface VariableObject {
	value?: ResolvedCSSProperties[`--${string}`]
	autocomplete?: VariableAutocomplete
	pruneUnused?: boolean
}

export type Variable = ResolvedCSSProperties[`--${string}`] | VariableObject

export type VariablesDefinition = {
	[key in UnionString | ResolvedSelector | (`--${string}` & {}) | ResolvedCSSVarProperty]?: Variable | VariablesDefinition
}

export interface VariablesConfig {
	/**
	 * Define CSS variables with support for static values and autocomplete configuration.
	 *
	 * @default {}
	 * @example
	 * ```ts
	 * {
	 *   variables: {
	 *     // The variable with value "null" will not be included in the final CSS, but can be used in autocompletion.
	 *     '--external-var': null,
	 *
	 *     '--color-bg': '#fff',
	 *     '--color-text': '#000',
	 *
	 *     '[data-theme="dark"]': {
	 *       '--color-bg': '#000',
	 *       '--color-text': '#fff',
	 *     },
	 *   },
	 * }
	 * ```
	 */
	variables: Arrayable<VariablesDefinition>

	/**
	 * Whether to prune unused variables from the final CSS.
	 *
	 * @default true
	 */
	pruneUnused?: boolean

	/**
	 * A list of CSS variables that should always be included in the final CSS, you can use this to prevent certain variables from being pruned.
	 *
	 * @default []
	 * @example
	 * ```ts
	 * {
	 *   variables: {
	 *     safeList: ['--external-var', '--color-bg', '--color-text'],
	 *   },
	 * }
	 * ```
	 */
	safeList?: ((`--${string}` & {}) | ResolvedCSSVarProperty)[]
}

declare module '@pikacss/core' {
	interface EngineConfig {
		variables?: VariablesConfig
	}

	interface Engine {
		variables: {
			store: Map<string, ResolvedVariable[]>
			add: (variables: VariablesDefinition) => void
		}
	}
}

export function variables() {
	let resolveVariables: (variables: VariablesDefinition) => ResolvedVariable[]
	let rawVariables: VariablesDefinition[]
	let safeSet: Set<string>
	return defineEnginePlugin({
		name: 'core:variables',

		rawConfigConfigured(config) {
			resolveVariables = createResolveVariablesFn({
				pruneUnused: config.variables?.pruneUnused,
			})
			rawVariables = [config.variables?.variables ?? []].flat()
			safeSet = new Set(config.variables?.safeList ?? [])
		},
		configureEngine(engine) {
			engine.variables = {
				store: new Map(),
				add: (variables: VariablesDefinition) => {
					const list = resolveVariables(variables)
					list.forEach((resolved) => {
						const { name, value, autocomplete: { asValueOf, asProperty } } = resolved

						asValueOf.forEach((p) => {
							if (p !== '-')
								engine.appendAutocompleteCssPropertyValues(p, `var(${name})`)
						})

						if (asProperty)
							engine.appendAutocompleteExtraCssProperties(name)

						if (value != null) {
							const list = engine.variables.store.get(name) ?? []
							list.push(resolved)
							engine.variables.store.set(name, list)
						}
					})
					engine.notifyPreflightUpdated()
				},
			}

			rawVariables.forEach(variables => engine.variables.add(variables))

			engine.addPreflight(async (engine) => {
				const used = new Set<string>()
				engine.store.atomicStyles.forEach(({ content: { value } }) => {
					value.flatMap(extractUsedVarNames)
						.forEach(name => used.add(normalizeVariableName(name)))
				})
				const usedVariables = Array.from(engine.variables.store.values())
					.flat()
					.filter(({ name, pruneUnused, value }) => (safeSet.has(name) || (pruneUnused === false) || used.has(name)) && value != null)
				const preflightDefinition: PreflightDefinition = {}

				for (const { name, value, selector: _selector } of usedVariables) {
					const selector = await engine.pluginHooks.transformSelectors(engine.config.plugins, _selector)
					let current = preflightDefinition
					selector.forEach((s) => {
						current[s] ||= {}
						current = current[s] as PreflightDefinition
					})
					Object.assign(current, { [name]: value })
				}
				return preflightDefinition
			})
		},
	})
}

interface ResolvedVariable {
	name: string
	value: InternalPropertyValue
	selector: string[]
	pruneUnused: boolean
	autocomplete: {
		asValueOf: string[]
		asProperty: boolean
	}
}

function createResolveVariablesFn({
	pruneUnused: defaultPruneUnused = true,
}: {
	pruneUnused?: boolean
} = {}) {
	function _resolveVariables(variables: VariablesDefinition, levels: string[], result: ResolvedVariable[]): ResolvedVariable[] {
		for (const [key, value] of Object.entries(variables)) {
			if (key.startsWith('--')) {
				const isObject = typeof value === 'object' && value !== null && !Array.isArray(value)
				const {
					value: varValue,
					autocomplete = {},
					pruneUnused = defaultPruneUnused,
				} = (isObject ? value : { value }) as VariableObject
				result.push({
					name: key,
					value: varValue,
					selector: levels.length > 0 ? levels : [':root'],
					autocomplete: {
						asValueOf: autocomplete.asValueOf ? [autocomplete.asValueOf].flat() : ['*'],
						asProperty: autocomplete.asProperty ?? true,
					},
					pruneUnused,
				})
			}
			else {
				_resolveVariables(value as VariablesDefinition, [...levels, key], result)
			}
		}
		return result
	}
	return function resolveVariables(variables: VariablesDefinition): ResolvedVariable[] {
		return _resolveVariables(variables, [], [])
	}
}

const VAR_NAME_RE = /var\((--[\w-]+)/g

export function extractUsedVarNames(input: string): string[] {
	const matched = input.match(VAR_NAME_RE)
	if (!matched)
		return []

	return matched.map((match) => {
		const varNameMatch = match.match(/--[^,)]+/)
		return varNameMatch ? varNameMatch[0] : ''
	})
		.filter(Boolean)
}

export function normalizeVariableName(name: string) {
	if (name.startsWith('--'))
		return name
	return `--${name}`
}
