import type { Awaitable, Nullish } from './types'
import { log } from './utils'

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
	protected _resolvedResultsMap: Map<string, ResolvedResult<T>> = new Map()
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
			.filter(string => rule.stringPattern.test(string))
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
			matched = string.match(rule.stringPattern)
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
