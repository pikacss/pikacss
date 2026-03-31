import { describe, expect, it } from 'vitest'

import { RecursiveResolver, resolveRuleConfig } from './resolver'

class StringResolver extends RecursiveResolver<string> {}

describe('recursiveResolver', () => {
	it('caches resolved values and clears matching cache entries when rules are removed', async () => {
		const resolver = new StringResolver()

		resolver.addStaticRule({
			key: 'btn',
			string: 'btn',
			resolved: ['button'],
		})
		resolver.addDynamicRule({
			key: 'space',
			stringPattern: /^space-(\d+)$/,
			createResolved: async matched => [`gap-${matched[1]}`],
		})

		expect(await resolver.resolve('btn'))
			.toEqual(['button'])
		expect(await resolver.resolve('space-4'))
			.toEqual(['gap-4'])
		expect(resolver._resolvedResultsMap.has('btn'))
			.toBe(true)
		expect(resolver._resolvedResultsMap.has('space-4'))
			.toBe(true)

		expect(resolver.staticRules)
			.toEqual([{ key: 'btn', string: 'btn', resolved: ['button'] }])
		expect(resolver.dynamicRules)
			.toHaveLength(1)

		// resolve again to hit cache path
		expect(await resolver.resolve('btn'))
			.toEqual(['button'])

		resolver.removeStaticRule('btn')
		resolver.removeDynamicRule('space')

		expect(resolver._resolvedResultsMap.has('btn'))
			.toBe(false)
		expect(resolver._resolvedResultsMap.has('space-4'))
			.toBe(false)
	})

	it('returns the original string when it encounters circular references or resolver errors', async () => {
		const resolver = new StringResolver()

		resolver.addStaticRule({
			key: 'a',
			string: 'a',
			resolved: ['b'],
		})
		resolver.addStaticRule({
			key: 'b',
			string: 'b',
			resolved: ['a'],
		})
		resolver.addDynamicRule({
			key: 'broken',
			stringPattern: /^broken$/,
			createResolved: async () => {
				throw new Error('boom')
			},
		})

		expect(await resolver.resolve('a'))
			.toEqual(['a'])
		expect(await resolver.resolve('broken'))
			.toEqual(['broken'])

		resolver.removeStaticRule('missing')
		resolver.removeDynamicRule('missing')
		resolver._setResolvedResult('broken', ['fixed'])
		resolver._setResolvedResult('broken', ['updated'])

		expect(resolver._resolvedResultsMap.get('broken'))
			.toEqual({ value: ['updated'] })
	})
})

describe('resolveRuleConfig', () => {
	it('supports string, static, dynamic, and object rule shapes', async () => {
		expect(resolveRuleConfig<string>('plain', 'selector'))
			.toBe('plain')

		expect(resolveRuleConfig<string>(['hover', '$:hover'], 'selector'))
			.toEqual({
				type: 'static',
				rule: {
					key: 'hover',
					string: 'hover',
					resolved: ['$:hover'],
				},
				autocomplete: ['hover'],
			})

		const dynamic = resolveRuleConfig<string>([/^space-(\d+)$/g, (matched: RegExpMatchArray) => `gap-${matched[1]}`, ['space-1']], 'selector')
		expect(dynamic)
			.toMatchObject({
				type: 'dynamic',
				rule: {
					key: '^space-(\\d+)$',
				},
				autocomplete: ['space-1'],
			})
		expect((dynamic as any).rule.stringPattern.global)
			.toBe(false)
		expect(await (dynamic as any).rule.createResolved('space-2'.match(/^space-(\d+)$/)!))
			.toEqual(['gap-2'])

		expect(resolveRuleConfig<string>({ selector: 'focus', value: '$:focus' }, 'selector'))
			.toEqual({
				type: 'static',
				rule: {
					key: 'focus',
					string: 'focus',
					resolved: ['$:focus'],
				},
				autocomplete: ['focus'],
			})

		expect(resolveRuleConfig<string>({ selector: /^nth-(\d+)$/, value: (matched: RegExpMatchArray) => `$:nth-child(${matched[1]})`, autocomplete: 'nth-2' }, 'selector'))
			.toMatchObject({
				type: 'dynamic',
				autocomplete: ['nth-2'],
			})

		const objDynamic = resolveRuleConfig<string>({ selector: /^obj-(\d+)$/, value: (matched: RegExpMatchArray) => `val-${matched[1]}` }, 'selector')
		expect(await (objDynamic as any).rule.createResolved('obj-5'.match(/^obj-(\d+)$/)!))
			.toEqual(['val-5'])

		expect(resolveRuleConfig<string>([/^raw-(\d+)$/, (matched: RegExpMatchArray) => `value-${matched[1]}`], 'selector'))
			.toMatchObject({
				type: 'dynamic',
				autocomplete: [],
			})
	})

	it('returns undefined for invalid rule shapes', () => {
		expect(resolveRuleConfig<string>(['bad', () => 'nope'] as any, 'selector'))
			.toBeUndefined()
		expect(resolveRuleConfig<string>({ selector: 1, value: 'x' } as any, 'selector'))
			.toBeUndefined()
		expect(resolveRuleConfig<string>(null as any, 'selector'))
			.toBeUndefined()
		expect(resolveRuleConfig<string>(123 as any, 'selector'))
			.toBeUndefined()
	})
})
