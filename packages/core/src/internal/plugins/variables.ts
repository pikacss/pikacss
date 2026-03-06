import type { Arrayable, InternalPropertyValue, PreflightDefinition, ResolvedCSSProperties, ResolvedSelector, UnionString } from '../types'
import { defineEnginePlugin } from '../plugin'
import { log } from '../utils'

type ResolvedCSSProperty = keyof ResolvedCSSProperties

export interface VariableAutocomplete {
	/**
	 * Specify the properties that the variable can be used as a value of.
	 * Use '-' to disable CSS value autocomplete for this variable.
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
	[key in UnionString | ResolvedSelector]?: Variable | VariablesDefinition
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
	safeList?: (`--${string}` & {})[]
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

			engine.addPreflight({
				id: 'core:variables',
				preflight: async (engine) => {
					const used = new Set<string>()

					// 1. Collect vars referenced by atomic styles.
					engine.store.atomicStyles.forEach(({ content: { value } }) => {
						value.flatMap(extractUsedVarNames)
							.forEach(name => used.add(normalizeVariableName(name)))
					})

					// 2. Collect vars referenced by other preflights (skip self to avoid recursion).
					const otherPreflights = engine.config.preflights.filter(p => p.id !== 'core:variables')
					const preflightResults = await Promise.all(
						otherPreflights.map(({ fn }) => Promise.resolve(fn(engine, false))
							.catch(() => null)),
					)
					preflightResults.forEach((result) => {
						if (result == null)
							return
						extractUsedVarNamesFromPreflightResult(result)
							.forEach(name => used.add(name))
					})

					// 3. Build a lookup map: variable name -> list of resolved variables.
					const varMap = new Map<string, ResolvedVariable[]>()
					for (const [name, list] of engine.variables.store.entries()) {
						varMap.set(name, list)
					}

					// 4. Expand `used` transitively: if a used variable's value references
					// other variables, those must also be considered used.
					const queue = Array.from(used)
					while (queue.length > 0) {
						const name = queue.pop()!
						const entries = varMap.get(name)
						if (!entries)
							continue
						for (const { value } of entries) {
							if (value == null)
								continue
							for (const refName of extractUsedVarNames(String(value))
								.map(normalizeVariableName)) {
								if (!used.has(refName)) {
									used.add(refName)
									queue.push(refName)
								}
							}
						}
					}

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
				},
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
	function isVariableScopeObject(value: Variable | VariablesDefinition): value is VariablesDefinition {
		return typeof value === 'object' && value !== null && !Array.isArray(value)
	}

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
						asValueOf: (autocomplete.asValueOf ? [autocomplete.asValueOf].flat() : ['*']) as string[],
						asProperty: autocomplete.asProperty ?? true,
					},
					pruneUnused,
				})
			}
			else {
				if (!isVariableScopeObject(value)) {
					log.warn(`Invalid variables scope for selector "${key}". Expected a nested object, received ${typeof value}. Skipping.`)
					continue
				}
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
	return Array.from(input.matchAll(VAR_NAME_RE), m => m[1]!)
}

export function normalizeVariableName(name: string) {
	if (name.startsWith('--'))
		return name
	return `--${name}`
}

/**
 * Recursively extract all CSS variable names referenced inside a preflight
 * result (either a plain CSS string or a `PreflightDefinition` object).
 */
export function extractUsedVarNamesFromPreflightResult(
	result: string | PreflightDefinition,
): string[] {
	if (typeof result === 'string') {
		return extractUsedVarNames(result)
			.map(normalizeVariableName)
	}
	const names: string[] = []
	for (const value of Object.values(result)) {
		if (value == null)
			continue
		if (typeof value === 'string' || typeof value === 'number') {
			extractUsedVarNames(String(value))
				.forEach(n => names.push(normalizeVariableName(n)))
		}
		else if (typeof value === 'object') {
			extractUsedVarNamesFromPreflightResult(value as PreflightDefinition)
				.forEach(n => names.push(n))
		}
	}
	return names
}
