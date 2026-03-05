import type { DynamicRule, StaticRule } from './resolver'
import { describe, expect, it, vi } from 'vitest'
import { AbstractResolver, RecursiveResolver, resolveRuleConfig } from './resolver'
import { log } from './utils'

class TestResolver extends AbstractResolver<string> {}

describe('abstractResolver', () => {
	describe('addStaticRule / removeStaticRule', () => {
		it('should add a static rule to the map', () => {
			const resolver = new TestResolver()
			const rule: StaticRule<string> = { key: 'a', string: 'foo', resolved: 'bar' }
			resolver.addStaticRule(rule)
			expect(resolver.staticRulesMap.get('a'))
				.toBe(rule)
		})

		it('should support chaining on addStaticRule', () => {
			const resolver = new TestResolver()
			const result = resolver
				.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })
				.addStaticRule({ key: 'b', string: 'baz', resolved: 'qux' })
			expect(result)
				.toBe(resolver)
			expect(resolver.staticRulesMap.size)
				.toBe(2)
		})

		it('should remove a static rule and its cached resolved result', async () => {
			const resolver = new TestResolver()
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })
			// Resolve to populate the cache
			await resolver._resolve('foo')
			expect(resolver._resolvedResultsMap.has('foo'))
				.toBe(true)

			resolver.removeStaticRule('a')
			expect(resolver.staticRulesMap.has('a'))
				.toBe(false)
			expect(resolver._resolvedResultsMap.has('foo'))
				.toBe(false)
		})

		it('should return this when removing a non-existent static rule', () => {
			const resolver = new TestResolver()
			const result = resolver.removeStaticRule('nonexistent')
			expect(result)
				.toBe(resolver)
		})

		it('should support chaining on removeStaticRule', () => {
			const resolver = new TestResolver()
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })
			resolver.addStaticRule({ key: 'b', string: 'baz', resolved: 'qux' })
			const result = resolver.removeStaticRule('a')
				.removeStaticRule('b')
			expect(result)
				.toBe(resolver)
			expect(resolver.staticRulesMap.size)
				.toBe(0)
		})

		it('should overwrite when adding a rule with the same key', () => {
			const resolver = new TestResolver()
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })
			resolver.addStaticRule({ key: 'a', string: 'foo2', resolved: 'bar2' })
			expect(resolver.staticRulesMap.size)
				.toBe(1)
			expect(resolver.staticRulesMap.get('a')!.resolved)
				.toBe('bar2')
		})
	})

	describe('addDynamicRule / removeDynamicRule', () => {
		it('should add a dynamic rule to the map', () => {
			const resolver = new TestResolver()
			const rule: DynamicRule<string> = {
				key: 'd1',
				stringPattern: /^color-(.+)$/,
				createResolved: matched => `resolved-${matched[1]}`,
			}
			resolver.addDynamicRule(rule)
			expect(resolver.dynamicRulesMap.get('d1'))
				.toBe(rule)
		})

		it('should support chaining on addDynamicRule', () => {
			const resolver = new TestResolver()
			const result = resolver
				.addDynamicRule({ key: 'd1', stringPattern: /^a-(.+)$/, createResolved: m => m[1]! })
				.addDynamicRule({ key: 'd2', stringPattern: /^b-(.+)$/, createResolved: m => m[1]! })
			expect(result)
				.toBe(resolver)
			expect(resolver.dynamicRulesMap.size)
				.toBe(2)
		})

		it('should remove a dynamic rule and clear matching cached results', async () => {
			const resolver = new TestResolver()
			resolver.addDynamicRule({
				key: 'd1',
				stringPattern: /^color-(.+)$/,
				createResolved: matched => `resolved-${matched[1]}`,
			})
			// Resolve some strings to populate the cache
			await resolver._resolve('color-red')
			await resolver._resolve('color-blue')
			expect(resolver._resolvedResultsMap.has('color-red'))
				.toBe(true)
			expect(resolver._resolvedResultsMap.has('color-blue'))
				.toBe(true)

			resolver.removeDynamicRule('d1')
			expect(resolver.dynamicRulesMap.has('d1'))
				.toBe(false)
			expect(resolver._resolvedResultsMap.has('color-red'))
				.toBe(false)
			expect(resolver._resolvedResultsMap.has('color-blue'))
				.toBe(false)
		})

		it('should only clear cached results matching the removed rule pattern', async () => {
			const resolver = new TestResolver()
			resolver.addDynamicRule({
				key: 'd1',
				stringPattern: /^color-(.+)$/,
				createResolved: matched => `color-${matched[1]}`,
			})
			resolver.addDynamicRule({
				key: 'd2',
				stringPattern: /^size-(.+)$/,
				createResolved: matched => `size-${matched[1]}`,
			})
			await resolver._resolve('color-red')
			await resolver._resolve('size-lg')

			resolver.removeDynamicRule('d1')
			expect(resolver._resolvedResultsMap.has('color-red'))
				.toBe(false)
			expect(resolver._resolvedResultsMap.has('size-lg'))
				.toBe(true)
		})

		it('should return this when removing a non-existent dynamic rule', () => {
			const resolver = new TestResolver()
			const result = resolver.removeDynamicRule('nonexistent')
			expect(result)
				.toBe(resolver)
		})
	})

	describe('staticRules / dynamicRules getters', () => {
		it('should return an array of static rules from the map', () => {
			const resolver = new TestResolver()
			const rule1: StaticRule<string> = { key: 'a', string: 'foo', resolved: 'bar' }
			const rule2: StaticRule<string> = { key: 'b', string: 'baz', resolved: 'qux' }
			resolver.addStaticRule(rule1)
				.addStaticRule(rule2)

			const rules = resolver.staticRules
			expect(rules)
				.toEqual([rule1, rule2])
			// Should return a new array each time
			expect(resolver.staticRules).not.toBe(rules)
		})

		it('should return an empty array when no static rules exist', () => {
			const resolver = new TestResolver()
			expect(resolver.staticRules)
				.toEqual([])
		})

		it('should return an array of dynamic rules from the map', () => {
			const resolver = new TestResolver()
			const rule1: DynamicRule<string> = { key: 'd1', stringPattern: /^a$/, createResolved: () => 'a' }
			const rule2: DynamicRule<string> = { key: 'd2', stringPattern: /^b$/, createResolved: () => 'b' }
			resolver.addDynamicRule(rule1)
				.addDynamicRule(rule2)

			const rules = resolver.dynamicRules
			expect(rules)
				.toEqual([rule1, rule2])
			expect(resolver.dynamicRules).not.toBe(rules)
		})

		it('should return an empty array when no dynamic rules exist', () => {
			const resolver = new TestResolver()
			expect(resolver.dynamicRules)
				.toEqual([])
		})
	})

	describe('_resolve', () => {
		it('should resolve a static rule match', async () => {
			const resolver = new TestResolver()
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })

			const result = await resolver._resolve('foo')
			expect(result)
				.toEqual({ value: 'bar' })
		})

		it('should resolve a dynamic rule match via regex', async () => {
			const resolver = new TestResolver()
			resolver.addDynamicRule({
				key: 'd1',
				stringPattern: /^color-(.+)$/,
				createResolved: matched => `resolved-${matched[1]}`,
			})

			const result = await resolver._resolve('color-red')
			expect(result)
				.toEqual({ value: 'resolved-red' })
		})

		it('should support async createResolved in dynamic rules', async () => {
			const resolver = new TestResolver()
			resolver.addDynamicRule({
				key: 'd1',
				stringPattern: /^async-(.+)$/,
				createResolved: async matched => `async-${matched[1]}`,
			})

			const result = await resolver._resolve('async-test')
			expect(result)
				.toEqual({ value: 'async-test' })
		})

		it('should return cached result on subsequent calls', async () => {
			const resolver = new TestResolver()
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })

			const result1 = await resolver._resolve('foo')
			const result2 = await resolver._resolve('foo')
			expect(result1)
				.toBe(result2) // Same reference
		})

		it('should return undefined when no rule matches', async () => {
			const resolver = new TestResolver()
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })

			const result = await resolver._resolve('unknown')
			expect(result)
				.toBeUndefined()
		})

		it('should prefer cached result over re-resolving', async () => {
			const resolver = new TestResolver()
			const createResolved = vi.fn((matched: RegExpMatchArray) => `resolved-${matched[1]}`)
			resolver.addDynamicRule({
				key: 'd1',
				stringPattern: /^x-(.+)$/,
				createResolved,
			})

			await resolver._resolve('x-first')
			await resolver._resolve('x-first')
			// createResolved should only be called once due to caching
			expect(createResolved)
				.toHaveBeenCalledTimes(1)
		})

		it('should call onResolved callback for static matches', async () => {
			const resolver = new TestResolver()
			const onResolved = vi.fn()
			resolver.onResolved = onResolved
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })

			await resolver._resolve('foo')
			expect(onResolved)
				.toHaveBeenCalledTimes(1)
			expect(onResolved)
				.toHaveBeenCalledWith('foo', 'static', { value: 'bar' })
		})

		it('should call onResolved callback for dynamic matches', async () => {
			const resolver = new TestResolver()
			const onResolved = vi.fn()
			resolver.onResolved = onResolved
			resolver.addDynamicRule({
				key: 'd1',
				stringPattern: /^color-(.+)$/,
				createResolved: matched => `resolved-${matched[1]}`,
			})

			await resolver._resolve('color-blue')
			expect(onResolved)
				.toHaveBeenCalledTimes(1)
			expect(onResolved)
				.toHaveBeenCalledWith('color-blue', 'dynamic', { value: 'resolved-blue' })
		})

		it('should not call onResolved when result is from cache', async () => {
			const resolver = new TestResolver()
			const onResolved = vi.fn()
			resolver.onResolved = onResolved
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })

			await resolver._resolve('foo')
			await resolver._resolve('foo')
			expect(onResolved)
				.toHaveBeenCalledTimes(1)
		})

		it('should not call onResolved when no rule matches', async () => {
			const resolver = new TestResolver()
			const onResolved = vi.fn()
			resolver.onResolved = onResolved

			await resolver._resolve('unknown')
			expect(onResolved).not.toHaveBeenCalled()
		})

		it('should try static rules before dynamic rules', async () => {
			const resolver = new TestResolver()
			const createResolved = vi.fn(() => 'dynamic-result')
			resolver.addStaticRule({ key: 's1', string: 'test', resolved: 'static-result' })
			resolver.addDynamicRule({
				key: 'd1',
				stringPattern: /^test$/,
				createResolved,
			})

			const result = await resolver._resolve('test')
			expect(result)
				.toEqual({ value: 'static-result' })
			expect(createResolved).not.toHaveBeenCalled()
		})

		it('should match the first dynamic rule when multiple patterns match', async () => {
			const resolver = new TestResolver()
			resolver.addDynamicRule({
				key: 'd1',
				stringPattern: /^color-(.+)$/,
				createResolved: matched => `first-${matched[1]}`,
			})
			resolver.addDynamicRule({
				key: 'd2',
				stringPattern: /^color-red$/,
				createResolved: () => 'second',
			})

			const result = await resolver._resolve('color-red')
			expect(result)
				.toEqual({ value: 'first-red' })
		})
	})

	describe('_setResolvedResult', () => {
		it('should set a new resolved result', () => {
			const resolver = new TestResolver()
			resolver._setResolvedResult('foo', 'bar')

			const result = resolver._resolvedResultsMap.get('foo')
			expect(result)
				.toEqual({ value: 'bar' })
		})

		it('should update an existing resolved result in place', async () => {
			const resolver = new TestResolver()
			resolver.addStaticRule({ key: 'a', string: 'foo', resolved: 'bar' })
			const result = await resolver._resolve('foo')

			resolver._setResolvedResult('foo', 'updated')
			// The same object reference should be updated
			expect(result)
				.toEqual({ value: 'updated' })
			expect(resolver._resolvedResultsMap.get('foo'))
				.toBe(result)
		})

		it('should create a new entry when updating a non-existent key', () => {
			const resolver = new TestResolver()
			resolver._setResolvedResult('new-key', 'new-value')
			expect(resolver._resolvedResultsMap.get('new-key'))
				.toEqual({ value: 'new-value' })
		})
	})
})

class TestRecursiveResolver extends RecursiveResolver<string> {}

describe('recursiveResolver', () => {
	it('should resolve strings recursively', async () => {
		const resolver = new TestRecursiveResolver()
		resolver.addStaticRule({ key: 'a', string: 'foo', resolved: ['bar', 'baz'] })
		resolver.addStaticRule({ key: 'b', string: 'bar', resolved: ['qux'] })

		const result = await resolver.resolve('foo')
		expect(result)
			.toEqual(['qux', 'baz'])
	})

	it('should return the original string if it cannot be resolved completely', async () => {
		const resolver = new TestRecursiveResolver()
		const result = await resolver.resolve('unknown')
		expect(result)
			.toEqual(['unknown'])
	})

	it('should handle errors during resolution gracefully', async () => {
		const resolver = new TestRecursiveResolver()
		resolver.addDynamicRule({
			key: 'err',
			stringPattern: /^err$/,
			createResolved: () => { throw new Error('intentional error') },
		})
		const result = await resolver.resolve('err')
		expect(result)
			.toEqual(['err'])
	})

	it('should detect a direct circular self-reference, emit a warning, and return the string as-is', async () => {
		const resolver = new TestRecursiveResolver()
		// 'loop' maps to itself, creating an immediate cycle
		resolver.addStaticRule({ key: 'loop', string: 'loop', resolved: ['loop'] })

		const warnSpy = vi.spyOn(log, 'warn')
		const result = await resolver.resolve('loop')
		expect(result)
			.toEqual(['loop'])
		expect(warnSpy)
			.toHaveBeenCalledWith(expect.stringContaining('Circular reference'))
		warnSpy.mockRestore()
	})

	it('should detect an indirect cycle (A → B → A), emit a warning, and terminate without infinite recursion', async () => {
		const resolver = new TestRecursiveResolver()
		resolver.addStaticRule({ key: 'a', string: 'a', resolved: ['b'] })
		resolver.addStaticRule({ key: 'b', string: 'b', resolved: ['a'] })

		const warnSpy = vi.spyOn(log, 'warn')
		const result = await resolver.resolve('a')
		// Cycle a->b->a: 'a' gets detected as circular, returned as-is, so result is ['a']
		expect(result)
			.toEqual(['a'])
		expect(warnSpy)
			.toHaveBeenCalledWith(expect.stringContaining('Circular reference'))
		warnSpy.mockRestore()
	})
})

describe('resolveRuleConfig', () => {
	it('should return a string as is', () => {
		expect(resolveRuleConfig('test', 'testKey'))
			.toBe('test')
	})

	it('should handle array static configs', () => {
		const result = resolveRuleConfig(['my-rule', 'resolved-value'], 'testKey')
		expect(result)
			.toEqual({
				type: 'static',
				rule: {
					key: 'my-rule',
					string: 'my-rule',
					resolved: ['resolved-value'],
				},
				autocomplete: ['my-rule'],
			})
	})

	it('should handle array dynamic configs', async () => {
		const matchFn = vi.fn()
			.mockResolvedValue('resolved-value')
		const result = resolveRuleConfig([/^my-(.+)$/, matchFn, 'my-test'], 'testKey')

		expect(typeof result)
			.toBe('object')
		if (typeof result === 'object' && result != null && 'type' in result && result.type === 'dynamic') {
			expect(result.autocomplete)
				.toEqual(['my-test'])
			expect(result.rule.key)
				.toBe('^my-(.+)$')
			const resolved = await result.rule.createResolved(['', 'test'] as any)
			expect(resolved)
				.toEqual(['resolved-value'])
			expect(matchFn)
				.toHaveBeenCalled()
		}
		else {
			throw new Error('Expected dynamic rule')
		}
	})

	it('should handle object static configs', () => {
		const result = resolveRuleConfig({ testKey: 'my-rule', value: 'resolved-value' }, 'testKey')
		expect(result)
			.toEqual({
				type: 'static',
				rule: {
					key: 'my-rule',
					string: 'my-rule',
					resolved: ['resolved-value'],
				},
				autocomplete: ['my-rule'],
			})
	})

	it('should handle object dynamic configs', async () => {
		const matchFn = vi.fn()
			.mockResolvedValue('resolved-value')
		const result = resolveRuleConfig({ testKey: /^my-(.+)$/, value: matchFn, autocomplete: 'my-test' }, 'testKey')

		expect(typeof result)
			.toBe('object')
		if (typeof result === 'object' && result != null && 'type' in result && result.type === 'dynamic') {
			expect(result.autocomplete)
				.toEqual(['my-test'])
			expect(result.rule.key)
				.toBe('^my-(.+)$')
			const resolved = await result.rule.createResolved(['', 'test'] as any)
			expect(resolved)
				.toEqual(['resolved-value'])
			expect(matchFn)
				.toHaveBeenCalled()
		}
		else {
			throw new Error('Expected dynamic rule')
		}
	})

	it('should return undefined for invalid configs', () => {
		expect(resolveRuleConfig(null, 'testKey'))
			.toBeUndefined()
		expect(resolveRuleConfig({}, 'testKey'))
			.toBeUndefined()
		expect(resolveRuleConfig([123, 'test'] as any, 'testKey'))
			.toBeUndefined()
	})

	it('should strip the global flag from regex patterns in dynamic rule configs (stripGlobalFlag)', () => {
		const fn = vi.fn()
			.mockReturnValue('result')
		const result = resolveRuleConfig([/^color-(.+)$/g, fn, 'color-test'], 'testKey')
		if (typeof result === 'object' && result != null && 'type' in result && result.type === 'dynamic') {
			expect(result.rule.stringPattern.global)
				.toBe(false)
			expect(result.rule.stringPattern.source)
				.toBe('^color-(.+)$')
		}
		else {
			throw new Error('Expected a dynamic rule result')
		}
	})

	it('should produce a non-global pattern that matches reliably across multiple invocations (stripGlobalFlag)', async () => {
		// Regression: a global regex used directly via addDynamicRule would have lastIndex pollution;
		// resolveRuleConfig strips the global flag to prevent this.
		const fn = vi.fn((m: RegExpMatchArray) => [`resolved-${m[1]}`])
		const config = resolveRuleConfig([/^item-(.+)$/g, fn], 'testKey')
		if (typeof config === 'object' && config != null && 'type' in config && config.type === 'dynamic') {
			const resolver = new TestRecursiveResolver()
			resolver.addDynamicRule(config.rule as DynamicRule<string[]>)
			const r1 = await resolver.resolve('item-alpha')
			const r2 = await resolver.resolve('item-beta')
			expect(r1)
				.toEqual(['resolved-alpha'])
			expect(r2)
				.toEqual(['resolved-beta'])
		}
		else {
			throw new Error('Expected a dynamic rule result')
		}
	})
})
