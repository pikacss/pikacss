import type { Awaitable, Nullish } from './types'
import { log } from './utils'

function stripGlobalFlag(re: RegExp): RegExp {
	if (!re.global)
		return re
	return new RegExp(re.source, re.flags.replace('g', ''))
}

export interface ResolvedResult<T> {
	value: T
}

export interface StaticRule<T> {
	key: string
	string: string
	resolved: T
}

export interface DynamicRule<T> {
	key: string
	stringPattern: RegExp
	createResolved: (matched: RegExpMatchArray) => Awaitable<T>
}

export abstract class AbstractResolver<T> {
	_resolvedResultsMap: Map<string, ResolvedResult<T>> = new Map()
	staticRulesMap: Map<string, StaticRule<T>> = new Map()
	dynamicRulesMap: Map<string, DynamicRule<T>> = new Map()
	onResolved: (string: string, type: 'static' | 'dynamic', result: ResolvedResult<T>) => void = () => {}

	get staticRules() {
		return [...this.staticRulesMap.values()]
	}

	get dynamicRules() {
		return [...this.dynamicRulesMap.values()]
	}

	addStaticRule(rule: StaticRule<T>) {
		log.debug(`Adding static rule: ${rule.key}`)
		this.staticRulesMap.set(rule.key, rule)
		return this
	}

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

	addDynamicRule(rule: DynamicRule<T>) {
		log.debug(`Adding dynamic rule: ${rule.key}`)
		this.dynamicRulesMap.set(rule.key, rule)
		return this
	}

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

	_setResolvedResult(string: string, resolved: T) {
		const resolvedResult = this._resolvedResultsMap.get(string)
		if (resolvedResult) {
			resolvedResult.value = resolved
			return
		}

		this._resolvedResultsMap.set(string, { value: resolved })
	}
}

export abstract class RecursiveResolver<T> extends AbstractResolver<T[]> {
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

export type ResolvedRuleConfig<T>
	= | { type: 'static', rule: StaticRule<T[]>, autocomplete: string[] }
		| { type: 'dynamic', rule: DynamicRule<T[]>, autocomplete: string[] }

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
