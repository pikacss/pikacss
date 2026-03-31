import type { VariableSemanticFamily } from '../generated-property-semantics'
import type { Arrayable, InternalPropertyValue, PreflightDefinition, ResolvedCSSProperties, ResolvedSelector, UnionString } from '../types'
import { VARIABLE_SEMANTIC_FAMILY_PROPERTIES } from '../generated-property-semantics'
import { defineEnginePlugin } from '../plugin'
import { log } from '../utils'

type ResolvedCSSProperty = keyof ResolvedCSSProperties

/**
 * Semantic type label for a CSS variable, used to derive which CSS properties it can auto-complete as a value for.
 *
 * @remarks Accepts any known `VariableSemanticFamily` (e.g. `'color'`, `'length'`) or an arbitrary string. Known families are expanded to their associated CSS property list at registration time.
 *
 * @example
 * ```ts
 * const type: VariableSemanticType = 'color'
 * ```
 */
export type VariableSemanticType = VariableSemanticFamily | UnionString

/**
 * Controls how a CSS variable participates in the autocomplete type surface.
 *
 * @remarks When `asValueOf` includes `'*'`, the variable appears as a value option for every CSS property. Use `'-'` to suppress value-of suggestions entirely.
 *
 * @example
 * ```ts
 * const auto: VariableAutocomplete = { asValueOf: ['color', 'background-color'], asProperty: true }
 * ```
 */
export interface VariableAutocomplete {
	/**
	 * CSS properties (or `'*'` for all, `'-'` for none) where this variable should appear as a `var()` value suggestion.
	 *
	 * @default undefined (inferred from `semanticType`, or `'*'` if neither is set)
	 */
	asValueOf?: Arrayable<UnionString | '*' | '-' | ResolvedCSSProperty>
	/**
	 * Whether this variable name should appear as an extra CSS property in the autocomplete surface.
	 *
	 * @default true
	 */
	asProperty?: boolean
}

/**
 * Expanded object form of a CSS variable definition with optional metadata.
 *
 * @remarks Use this form when the variable needs semantic typing, custom autocomplete behaviour, or opt-out of unused-pruning.
 *
 * @example
 * ```ts
 * const v: VariableObject = {
 *   value: '#3b82f6',
 *   semanticType: 'color',
 *   autocomplete: { asValueOf: '*' },
 *   pruneUnused: false,
 * }
 * ```
 */
export interface VariableObject {
	/**
	 * The CSS value assigned to this variable.
	 *
	 * @default undefined (variable is registered for autocomplete only, no value emitted)
	 */
	value?: ResolvedCSSProperties[`--${string}`]
	/**
	 * Semantic family labels controlling which CSS properties this variable auto-completes as a value for.
	 *
	 * @default undefined (all properties when `autocomplete.asValueOf` is also unset)
	 */
	semanticType?: Arrayable<VariableSemanticType>
	/**
	 * Fine-grained control over this variable's autocomplete behaviour.
	 *
	 * @default undefined (inferred from `semanticType`)
	 */
	autocomplete?: VariableAutocomplete
	/**
	 * Whether this variable should be pruned from the output when it is not referenced by any atomic style or preflight.
	 *
	 * @default true (inherits from `VariablesConfig.pruneUnused`)
	 */
	pruneUnused?: boolean
}

/**
 * A CSS variable value, either a plain CSS value string/number or a `VariableObject` with metadata.
 *
 * @remarks Use the short form for simple values. Use `VariableObject` when semantic typing, autocomplete control, or pruning opt-out is needed.
 *
 * @example
 * ```ts
 * const simple: Variable = '#fff'
 * const rich: Variable = { value: '#fff', semanticType: 'color' }
 * ```
 */
export type Variable = ResolvedCSSProperties[`--${string}`] | VariableObject

/**
 * A nested record mapping CSS variable names (`--*`) and optional selector scopes to variable definitions.
 *
 * @remarks Non-`--` keys are treated as selector scopes (e.g. `'.dark'`, `'@media ...'`) that nest the enclosed variables under that selector. Keys starting with `--` define actual CSS variables.
 *
 * @example
 * ```ts
 * const def: VariablesDefinition = {
 *   '--color-primary': '#3b82f6',
 *   '.dark': { '--color-primary': '#60a5fa' },
 * }
 * ```
 */
export type VariablesDefinition = {
	[key in UnionString | ResolvedSelector]?: Variable | VariablesDefinition
}

/**
 * Configuration object for the `variables` engine option.
 *
 * @remarks Passed via `EngineConfig.variables` to define CSS custom properties, control pruning, and specify a safe list.
 *
 * @example
 * ```ts
 * const config: VariablesConfig = {
 *   variables: { '--color-primary': '#3b82f6' },
 *   pruneUnused: true,
 *   safeList: ['--color-primary'],
 * }
 * ```
 */
export interface VariablesConfig {
	/** One or more variable definition objects to register. */
	variables: Arrayable<VariablesDefinition>

	/**
	 * Default pruning policy for variables that are not referenced by any atomic style or preflight.
	 *
	 * @default true
	 */
	pruneUnused?: boolean

	/**
	 * Variable names that should always be emitted regardless of usage.
	 *
	 * @default []
	 */
	safeList?: (`--${string}` & {})[]
}

declare module '@pikacss/core' {
	interface EngineConfig {
		/**
		 * CSS custom properties (variables) configuration.
		 *
		 * @default undefined
		 */
		variables?: VariablesConfig
	}

	interface Engine {
		/** Runtime variable management: resolved variable store and `add` method for registering variables after engine creation. */
		variables: {
			store: Map<string, ResolvedVariable[]>
			add: (variables: VariablesDefinition) => void
		}
	}
}

/**
 * Built-in engine plugin that provides CSS custom properties (variables) with smart pruning and autocomplete integration.
 *
 * @returns An `EnginePlugin` that registers variable definitions, manages a preflight for emitting `:root` / scoped variables, and prunes unused variables from the output.
 *
 * @remarks Reads `EngineConfig.variables` during `rawConfigConfigured` and attaches the `engine.variables` management interface during `configureEngine`. A preflight is registered that collects variable references from atomic styles and other preflights, transitively expands dependencies, and emits only used (or safe-listed) variables.
 *
 * @example
 * ```ts
 * createEngine({ plugins: [variables()] })
 * ```
 */
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
						const cssProperties = Object.fromEntries(
							asValueOf
								.filter(p => p !== '-')
								.map(p => [p, `var(${name})`]),
						)

						engine.appendAutocomplete({
							cssProperties,
							extraCssProperties: asProperty ? name : undefined,
						})

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
						otherPreflights.map(({ fn }) => Promise.resolve()
							.then(() => fn(engine, false))
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
							const referencedValue = Array.isArray(value) ? value.join(' ') : String(value)
							for (const refName of extractUsedVarNames(referencedValue)
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
					semanticType,
					autocomplete = {},
					pruneUnused = defaultPruneUnused,
				} = (isObject ? value : { value }) as VariableObject
				result.push({
					name: key,
					value: varValue,
					selector: levels.length > 0 ? levels : [':root'],
					autocomplete: {
						asValueOf: resolveAutocompleteValueTargets({
							name: key,
							asValueOf: autocomplete.asValueOf,
							semanticType,
						}),
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

function resolveAutocompleteValueTargets({
	name,
	asValueOf,
	semanticType,
}: {
	name: string
	asValueOf?: Arrayable<UnionString | '*' | '-' | ResolvedCSSProperty>
	semanticType?: Arrayable<VariableSemanticType>
}) {
	const explicitTargets = asValueOf == null
		? []
		: [asValueOf].flat()
				.map(value => String(value))
	const semanticTypes = semanticType == null
		? []
		: [semanticType].flat()
				.map(value => String(value))

	if (explicitTargets.includes('-'))
		return []

	const targets = new Set<string>()

	if (asValueOf == null && semanticTypes.length === 0)
		targets.add('*')

	explicitTargets.forEach((target) => {
		targets.add(target)
	})

	semanticTypes.forEach((family) => {
		const properties = VARIABLE_SEMANTIC_FAMILY_PROPERTIES[family as VariableSemanticFamily]
		if (properties != null) {
			properties.forEach(property => targets.add(property))
			return
		}

		log.warn(`Unknown semanticType "${family}" for variable "${name}". Skipping semantic autocomplete expansion.`)
	})

	if (targets.has('*'))
		return ['*']

	return [...targets]
}

const VAR_NAME_RE = /var\((--[\w-]+)/g

/**
 * Extracts all CSS variable names referenced via `var(--*)` calls in a string.
 *
 * @param input - The CSS value string to scan.
 * @returns An array of variable names (including the `--` prefix) found in `var()` expressions.
 *
 * @remarks Uses a global regex to find all `var(--name)` occurrences. Nested `var()` calls are matched independently.
 *
 * @example
 * ```ts
 * extractUsedVarNames('color: var(--primary)')  // ['--primary']
 * extractUsedVarNames('var(--a) var(--b)')       // ['--a', '--b']
 * ```
 */
export function extractUsedVarNames(input: string): string[] {
	return Array.from(input.matchAll(VAR_NAME_RE), m => m[1]!)
}

/**
 * Ensures a variable name has the `--` prefix.
 *
 * @param name - The variable name, with or without the `--` prefix.
 * @returns The name with a guaranteed `--` prefix.
 *
 * @remarks A no-op when the name already starts with `--`.
 *
 * @example
 * ```ts
 * normalizeVariableName('color')     // '--color'
 * normalizeVariableName('--color')   // '--color'
 * ```
 */
export function normalizeVariableName(name: string) {
	if (name.startsWith('--'))
		return name
	return `--${name}`
}

/**
 * Recursively extracts all CSS variable names referenced in a preflight result.
 *
 * @param result - A preflight output: either a raw CSS string or a nested `PreflightDefinition` object.
 * @returns A flat array of normalized variable names found in the result.
 *
 * @remarks For string results, scans for `var(--*)` references. For object results, recursively traverses selector scopes and string/number values. All returned names are normalized with the `--` prefix.
 *
 * @example
 * ```ts
 * extractUsedVarNamesFromPreflightResult({ ':root': { color: 'var(--primary)' } })
 * // ['--primary']
 * ```
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
			continue
		}
		extractUsedVarNamesFromPreflightResult(value as PreflightDefinition)
			.forEach(n => names.push(n))
	}
	return names
}
