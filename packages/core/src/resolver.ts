import type { Awaitable, Nullish } from './types'
import { log } from './utils'

function stripGlobalFlag(re: RegExp): RegExp {
	if (!re.global)
		return re
	return new RegExp(re.source, re.flags.replace('g', ''))
}

/**
 * Wrapper holding a resolved value, used as the cache entry in resolver maps.
 * @internal
 *
 * @typeParam T - The type of the resolved value.
 *
 * @remarks Stored in `_resolvedResultsMap` to distinguish "resolved to a value" from "not yet resolved". The wrapper is mutable so `_setResolvedResult` can update it in place.
 *
 * @example
 * ```ts
 * const result: ResolvedResult<string[]> = { value: ['hover:'] }
 * ```
 */
export interface ResolvedResult<T> {
	/** The resolved value. */
	value: T
}

/**
 * A rule that matches an exact input string and returns a pre-computed resolved value.
 * @internal
 *
 * @typeParam T - The type of the resolved value.
 *
 * @remarks Static rules are checked first during resolution. If the input string matches `rule.string`, the `resolved` value is returned immediately without regex matching.
 *
 * @example
 * ```ts
 * const rule: StaticRule<string[]> = { key: 'hover', string: 'hover', resolved: ['&:hover'] }
 * ```
 */
export interface StaticRule<T> {
	/** Unique key used for registration, removal, and deduplication. */
	key: string
	/** The exact input string this rule matches. */
	string: string
	/** The pre-computed value returned when this rule matches. */
	resolved: T
}

/**
 * A rule that matches input strings via a regex pattern and lazily computes the resolved value from the match.
 * @internal
 *
 * @typeParam T - The type of the resolved value.
 *
 * @remarks Dynamic rules are tried in registration order after all static rules fail to match. The `stringPattern` must not have the global flag (it is stripped on creation). The `createResolved` callback receives the regex match array and may be async.
 *
 * @example
 * ```ts
 * const rule: DynamicRule<string[]> = {
 *   key: 'media-\\d+',
 *   stringPattern: /^media-(\d+)$/,
 *   createResolved: async (m) => [`@media (min-width: ${m[1]}px)`],
 * }
 * ```
 */
export interface DynamicRule<T> {
	/** Unique key used for registration, removal, and deduplication. */
	key: string
	/** Regex pattern (without global flag) tested against input strings. */
	stringPattern: RegExp
	/** Factory function that computes the resolved value from the regex match. */
	createResolved: (matched: RegExpMatchArray) => Awaitable<T>
}

/**
 * Base resolver class that manages static and dynamic rules and caches resolution results.
 * @internal
 *
 * @typeParam T - The type of resolved values.
 *
 * @remarks Subclasses override resolution behavior (e.g. `RecursiveResolver` adds recursive expansion). The base class handles rule storage, cache lookup, and the static-then-dynamic matching order. Results are cached in `_resolvedResultsMap` for subsequent lookups.
 *
 * @example
 * ```ts
 * class MyResolver extends AbstractResolver<string> { }
 * const r = new MyResolver()
 * r.addStaticRule({ key: 'x', string: 'x', resolved: 'X' })
 * ```
 */
export abstract class AbstractResolver<T> {
	/** Cache of previously resolved input-string → result pairs. */
	_resolvedResultsMap: Map<string, ResolvedResult<T>> = new Map()
	/** Registry of static rules keyed by their unique key. */
	staticRulesMap: Map<string, StaticRule<T>> = new Map()
	/** Registry of dynamic rules keyed by their unique key. */
	dynamicRulesMap: Map<string, DynamicRule<T>> = new Map()
	/** Callback invoked after a successful resolution, receiving the input string, rule type, and result. */
	onResolved: (string: string, type: 'static' | 'dynamic', result: ResolvedResult<T>) => void = () => {}

	get staticRules() {
		return [...this.staticRulesMap.values()]
	}

	get dynamicRules() {
		return [...this.dynamicRulesMap.values()]
	}

	/**
	 * Registers a static rule in the resolver.
	 *
	 * @param rule - The static rule to register.
	 * @returns `this` for chaining.
	 *
	 * @remarks Overwrites any existing static rule with the same key.
	 *
	 * @example
	 * ```ts
	 * resolver.addStaticRule({ key: 'dark', string: 'dark', resolved: ['.dark &'] })
	 * ```
	 */
	addStaticRule(rule: StaticRule<T>) {
		log.debug(`Adding static rule: ${rule.key}`)
		this.staticRulesMap.set(rule.key, rule)
		return this
	}

	/**
	 * Removes a static rule and its cached resolution result.
	 *
	 * @param key - The key of the static rule to remove.
	 * @returns `this` for chaining.
	 *
	 * @remarks Logs a warning if the key does not exist. Also evicts the cached result for the rule's input string.
	 *
	 * @example
	 * ```ts
	 * resolver.removeStaticRule('dark')
	 * ```
	 */
	removeStaticRule(key: string) {
		const rule = this.staticRulesMap.get(key)
		if (rule == null) {
			log.warn(`Static rule not found for removal: ${key}`)
			return this
		}

		log.debug(`Removing static rule: ${key}`)
		this.staticRulesMap.delete(key)
		this._resolvedResultsMap.delete(rule.string)
		return this
	}

	/**
	 * Registers a dynamic rule in the resolver.
	 *
	 * @param rule - The dynamic rule to register.
	 * @returns `this` for chaining.
	 *
	 * @remarks Overwrites any existing dynamic rule with the same key.
	 *
	 * @example
	 * ```ts
	 * resolver.addDynamicRule({ key: 'bp', stringPattern: /^bp-(\d+)$/, createResolved: m => [`@media (min-width: ${m[1]}px)`] })
	 * ```
	 */
	addDynamicRule(rule: DynamicRule<T>) {
		log.debug(`Adding dynamic rule: ${rule.key}`)
		this.dynamicRulesMap.set(rule.key, rule)
		return this
	}

	/**
	 * Removes a dynamic rule and evicts all cached results that its pattern matched.
	 *
	 * @param key - The key of the dynamic rule to remove.
	 * @returns `this` for chaining.
	 *
	 * @remarks Iterates through all cached results and deletes any whose input string matches the removed rule's pattern. Logs a warning if the key does not exist.
	 *
	 * @example
	 * ```ts
	 * resolver.removeDynamicRule('bp')
	 * ```
	 */
	removeDynamicRule(key: string) {
		const rule = this.dynamicRulesMap.get(key)
		if (rule == null) {
			log.warn(`Dynamic rule not found for removal: ${key}`)
			return this
		}

		log.debug(`Removing dynamic rule: ${key}`)
		const matchedResolvedStringList = Array.from(this._resolvedResultsMap.keys())
			.filter((string) => {
				rule.stringPattern.lastIndex = 0
				return rule.stringPattern.test(string)
			})
		this.dynamicRulesMap.delete(key)
		matchedResolvedStringList.forEach(string => this._resolvedResultsMap.delete(string))
		log.debug(`  - Cleared ${matchedResolvedStringList.length} cached results`)
		return this
	}

	/**
	 * Attempts to resolve an input string by checking cached results, then static rules, then dynamic rules in order.
	 *
	 * @param string - The input string to resolve.
	 * @returns The resolved result wrapper, or `null`/`undefined` if no rule matches.
	 *
	 * @remarks Results are cached for subsequent calls. Invokes `onResolved` after a successful match. Dynamic rule matching is async because `createResolved` may return a `Promise`.
	 *
	 * @example
	 * ```ts
	 * const result = await resolver._resolve('hover')
	 * ```
	 */
	async _resolve(string: string): Promise<ResolvedResult<T> | Nullish> {
		const existedResult = this._resolvedResultsMap.get(string)
		if (existedResult != null) {
			log.debug(`Resolved from cache: ${string}`)
			return existedResult
		}

		const staticRule = Array.from(this.staticRulesMap.values())
			.find(rule => rule.string === string)
		if (staticRule != null) {
			log.debug(`Resolved by static rule: ${staticRule.key}`)
			const resolvedResult = { value: staticRule.resolved }
			this._resolvedResultsMap.set(string, resolvedResult)
			this.onResolved(string, 'static', resolvedResult)
			return resolvedResult
		}

		let dynamicRule: DynamicRule<T> | Nullish
		let matched: RegExpMatchArray | Nullish
		for (const rule of this.dynamicRulesMap.values()) {
			rule.stringPattern.lastIndex = 0
			matched = rule.stringPattern.exec(string)
			if (matched != null) {
				dynamicRule = rule
				break
			}
		}
		if (dynamicRule != null && matched != null) {
			log.debug(`Resolved by dynamic rule: ${dynamicRule.key}`)
			const resolvedResult = { value: await dynamicRule.createResolved(matched) }
			this._resolvedResultsMap.set(string, resolvedResult)
			this.onResolved(string, 'dynamic', resolvedResult)
			return resolvedResult
		}

		log.debug(`Resolution failed for: ${string}`)
		return void 0
	}

	/**
	 * Updates or creates the cached resolved result for a given input string.
	 *
	 * @param string - The input string whose cached result should be updated.
	 * @param resolved - The new resolved value to store.
	 *
	 * @remarks If a cached `ResolvedResult` already exists for `string`, its `value` property is mutated in place. Otherwise a new entry is created. This allows `RecursiveResolver` to retroactively update partially resolved values without allocating a new wrapper.
	 *
	 * @example
	 * ```ts
	 * resolver._setResolvedResult('hover', ['&:hover'])
	 * ```
	 */
	_setResolvedResult(string: string, resolved: T) {
		const resolvedResult = this._resolvedResultsMap.get(string)
		if (resolvedResult) {
			resolvedResult.value = resolved
			return
		}

		this._resolvedResultsMap.set(string, { value: resolved })
	}
}

/**
 * Resolver subclass that recursively expands resolved values until all string references are fully resolved.
 * @internal
 *
 * @typeParam T - The element type of the final resolved array.
 *
 * @remarks Each resolution step may return a mix of final values and string references. The `resolve` method recurses into string values, flattening nested references while detecting circular dependencies via a visited set.
 *
 * @example
 * ```ts
 * class SelectorResolver extends RecursiveResolver<string> { }
 * const result = await resolver.resolve('hover-focus')
 * // ['&:hover', '&:focus'] after recursive expansion
 * ```
 */
export abstract class RecursiveResolver<T> extends AbstractResolver<T[]> {
	/**
	 * Recursively resolves an input string into a flat array of final values.
	 *
	 * @param string - The input string to resolve.
	 * @param _visited - Accumulator set for cycle detection; callers should omit this.
	 * @returns A flat array of resolved values. If no rule matches, returns `[string]` cast to `T`.
	 *
	 * @remarks Detects circular references and short-circuits by returning the unresolved string. After full expansion, the cache is updated with the final flat result via `_setResolvedResult`.
	 *
	 * @example
	 * ```ts
	 * const selectors = await resolver.resolve('hover')
	 * ```
	 */
	async resolve(string: string, _visited?: Set<string>): Promise<T[]> {
		const visited = _visited ?? new Set<string>()
		if (visited.has(string)) {
			log.warn(`Circular reference detected for "${string}", returning as-is`)
			return [string as unknown as T]
		}
		visited.add(string)

		const resolved = await this._resolve(string)
			.catch((error) => {
				log.warn(`Failed to resolve "${string}": ${error.message}`, error)
				return void 0
			})
		if (resolved == null)
			return [string as unknown as T]

		const result: T[] = []
		for (const partial of resolved.value) {
			if (typeof partial === 'string')
				result.push(...await this.resolve(partial, new Set(visited)))
			else
				result.push(partial)
		}
		this._setResolvedResult(string, result)

		return result
	}
}

/**
 * Discriminated union describing a resolved rule configuration, either static or dynamic.
 * @internal
 *
 * @typeParam T - The element type of the rule's resolved value array.
 *
 * @remarks Produced by `resolveRuleConfig` from user-supplied shorthand configurations. The `autocomplete` array feeds the autocomplete type surface so IDE completions stay in sync with runtime rules.
 *
 * @example
 * ```ts
 * const config: ResolvedRuleConfig<string> = {
 *   type: 'static',
 *   rule: { key: 'hover', string: 'hover', resolved: ['&:hover'] },
 *   autocomplete: ['hover'],
 * }
 * ```
 */
export type ResolvedRuleConfig<T>
	= | { type: 'static', rule: StaticRule<T[]>, autocomplete: string[] }
		| { type: 'dynamic', rule: DynamicRule<T[]>, autocomplete: string[] }

/**
 * Normalizes a user-supplied rule shorthand into a `ResolvedRuleConfig`, a plain redirect string, or `undefined`.
 * @internal
 *
 * @typeParam T - The element type of the rule's resolved value array.
 * @param config - The raw rule configuration: a string redirect, a tuple (`[string, value]` or `[RegExp, fn, autocomplete?]`), or an object with `keyName` and `value` properties.
 * @param keyName - The property name on an object-form config that holds the match key or pattern.
 * @returns A `ResolvedRuleConfig<T>` for valid static/dynamic configs, the original string for redirect configs, or `undefined` if the config shape is unrecognized.
 *
 * @remarks Handles three config shapes:
 * - **String**: returned as-is for the caller to treat as a redirect to another rule.
 * - **Tuple**: `[string, T | T[]]` for static rules, `[RegExp, fn, autocomplete?]` for dynamic rules.
 * - **Object**: `{ [keyName]: string | RegExp, value: T | fn, autocomplete?: string[] }`.
 *
 * @example
 * ```ts
 * resolveRuleConfig(['hover', '&:hover'], 'selector')
 * // { type: 'static', rule: { key: 'hover', ... }, autocomplete: ['hover'] }
 * ```
 */
export function resolveRuleConfig<T>(config: any, keyName: string): ResolvedRuleConfig<T> | string | Nullish {
	if (typeof config === 'string') {
		return config
	}
	if (Array.isArray(config)) {
		if (typeof config[0] === 'string' && typeof config[1] !== 'function') {
			return {
				type: 'static',
				rule: {
					key: config[0],
					string: config[0],
					resolved: [config[1]].flat(1) as T[],
				},
				autocomplete: [config[0]],
			}
		}

		if (config[0] instanceof RegExp && typeof config[1] === 'function') {
			const fn = config[1]
			return {
				type: 'dynamic',
				rule: {
					key: config[0].source,
					stringPattern: stripGlobalFlag(config[0]),
					createResolved: async match => [await fn(match)].flat(1) as T[],
				},
				autocomplete: config[2] != null ? [config[2]].flat(1) : [],
			}
		}
		return void 0
	}

	if (typeof config !== 'object' || config === null) {
		return void 0
	}

	const configKey = config[keyName]
	if (typeof configKey === 'string' && typeof config.value !== 'function') {
		return {
			type: 'static',
			rule: {
				key: configKey,
				string: configKey,
				resolved: [config.value].flat(1) as T[],
			},
			autocomplete: [configKey],
		}
	}
	if (configKey instanceof RegExp && typeof config.value === 'function') {
		const fn = config.value
		return {
			type: 'dynamic',
			rule: {
				key: configKey.source,
				stringPattern: stripGlobalFlag(configKey),
				createResolved: async match => [await fn(match)].flat(1) as T[],
			},
			autocomplete: ('autocomplete' in config && config.autocomplete != null)
				? [config.autocomplete].flat(1)
				: [],
		}
	}

	return void 0
}
