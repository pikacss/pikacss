import type { Arrayable, PreflightDefinition, PropertyValue, ResolvedCSSProperties, ResolvedSelector, Simplify, UnionString } from '../types'
import { defineEnginePlugin } from '../plugin'

type CSSProperty = keyof ResolvedCSSProperties

export interface VariableAutocomplete {
	/**
	 * Specify the properties that the variable can be used as a value of.
	 *
	 * @default ['*']
	 */
	asValueOf?: Arrayable<UnionString | '*' | '-' | CSSProperty>
	/**
	 * Whether to add the variable as a CSS property.
	 *
	 * @default true
	 */
	asProperty?: boolean
}

interface VariableOptions {
	selector?: Arrayable<UnionString | ResolvedSelector>
	autocomplete?: VariableAutocomplete
	pruneUnused?: boolean
}

export type Variable =
	| string
	| [name: string, value?: ResolvedCSSProperties[`--${string}`], options?: VariableOptions]
	| Simplify<{ name: string, value?: ResolvedCSSProperties[`--${string}`] } & VariableOptions>

export interface VariablesConfig {
	/**
	 * Define CSS variables with support for static values and autocomplete configuration.
	 *
	 * @default []
	 * @example
	 * ```ts
	 * {
	 *   variables: [
	 *     // Basic usage
	 *     ['primary', '#ff0000'],
	 *     // With autocomplete configuration
	 *     ['accent', '#00ff00', {
	 *       asValueOf: ['color', 'background-color'],
	 *       asProperty: true
	 *     }]
	 *   ]
	 * }
	 * ```
	 */
	variables: Variable[]

	/**
	 * Whether to prune unused variables from the final CSS.
	 *
	 * @default true
	 */
	pruneUnused?: boolean
}

declare module '@pikacss/core' {
	interface EngineConfig {
		variables?: VariablesConfig
	}

	interface Engine {
		variables: {
			store: Map<string, ResolvedVariableConfig>
			add: (...list: Variable[]) => void
		}
	}
}

export function variables() {
	let resolveVariableConfig: (config: Variable) => ResolvedVariableConfig
	let configList: Variable[]
	return defineEnginePlugin({
		name: 'core:variables',

		rawConfigConfigured(config) {
			resolveVariableConfig = createResolveConfigFn({
				pruneUnused: config.variables?.pruneUnused,
			})
			configList = config.variables?.variables ?? []
		},
		configureEngine(engine) {
			engine.variables = {
				store: new Map(),
				add: (...list) => {
					list.forEach((config) => {
						const resolved = resolveVariableConfig(config)
						const { name: _name, value, autocomplete: { asValueOf, asProperty } } = resolved
						const name = normalizeVariableName(_name)

						asValueOf.forEach((p) => {
							if (p !== '-')
								engine.appendAutocompleteCssPropertyValues(p, `var(${name})`)
						})

						if (asProperty)
							engine.appendAutocompleteExtraCssProperties(name)

						if (value != null)
							engine.variables.store.set(name, resolved)
					})
					engine.notifyPreflightUpdated()
				},
			}

			engine.variables.add(...configList)

			engine.addPreflight(async (engine) => {
				const used = new Set<string>()
				engine.store.atomicStyles.forEach(({ content: { value } }) => {
					value.flatMap(extractUsedVarNames)
						.forEach(name => used.add(normalizeVariableName(name)))
				})
				const usedVariables = Array.from(engine.variables.store.values())
					.filter(({ name, pruneUnused, value }) => ((pruneUnused === false) || used.has(name)) && value != null)
				const preflightDefinition: PreflightDefinition = {}

				await Promise.all(usedVariables.map(async ({ name, value, selector: _selector }) => {
					const selector = await engine.pluginHooks.transformSelectors(engine.config.plugins, _selector)
					selector.forEach((s, index) => {
						preflightDefinition[s] ||= {}
						const isLast = index === selector.length - 1
						if (isLast) {
							preflightDefinition[s][name] = value
						}
					})
				}))
				return preflightDefinition
			})
		},
	})
}

interface ResolvedVariableConfig {
	name: string
	value: PropertyValue
	selector: string[]
	pruneUnused: boolean
	autocomplete: {
		asValueOf: string[]
		asProperty: boolean
	}
}

function createResolveConfigFn({
	pruneUnused: defaultPruneUnused = true,
}: {
	pruneUnused?: boolean
} = {}) {
	return function resolveVariableConfig(config: Variable): ResolvedVariableConfig {
		if (typeof config === 'string')
			return { name: config, value: null, selector: [':root'], autocomplete: { asValueOf: ['*'], asProperty: true }, pruneUnused: defaultPruneUnused }
		if (Array.isArray(config)) {
			const [name, value, { selector = ':root', autocomplete: { asValueOf = '*', asProperty = true } = {}, pruneUnused = defaultPruneUnused } = {}] = config
			return { name, value, selector: [selector].flat(), autocomplete: { asValueOf: [asValueOf].flat(), asProperty }, pruneUnused }
		}
		const { name, value, selector = ':root', autocomplete: { asValueOf = '*', asProperty = true } = {}, pruneUnused = defaultPruneUnused } = config
		return { name, value, selector: [selector].flat(), autocomplete: { asValueOf: [asValueOf].flat(), asProperty }, pruneUnused }
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
	}).filter(Boolean)
}

export function normalizeVariableName(name: string) {
	if (name.startsWith('--'))
		return name
	return `--${name}`
}
