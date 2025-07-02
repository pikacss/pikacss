import { describe, expect, it } from 'vitest'
import { AbstractResolver } from '../../../src/internal/resolver'

class TestResolver extends AbstractResolver<string> {}

describe('abstractResolver', () => {
	it('should add and resolve a static rule', async () => {
		const resolver = new TestResolver()
		resolver.addStaticRule({ key: 'test', string: 'test-string', resolved: 'resolved-value' })
		const result = await resolver._resolve('test-string')
		expect(result?.value).toBe('resolved-value')
	})

	it('should remove a static rule', async () => {
		const resolver = new TestResolver()
		resolver.addStaticRule({ key: 'test', string: 'test-string', resolved: 'resolved-value' })
		resolver.removeStaticRule('test')
		const result = await resolver._resolve('test-string')
		expect(result).toBeUndefined()
	})

	it('should add and resolve a dynamic rule', async () => {
		const resolver = new TestResolver()
		resolver.addDynamicRule({ key: 'test', stringPattern: /^test-(.*)$/, createResolved: match => `resolved-${match[1]}` })
		const result = await resolver._resolve('test-123')
		expect(result?.value).toBe('resolved-123')
	})

	it('should remove a dynamic rule', async () => {
		const resolver = new TestResolver()
		resolver.addDynamicRule({ key: 'test', stringPattern: /^test-(.*)$/, createResolved: match => `resolved-${match[1]}` })
		resolver.removeDynamicRule('test')
		const result = await resolver._resolve('test-123')
		expect(result).toBeUndefined()
	})

	it('should set a resolved result', async () => {
		const resolver = new TestResolver()
		resolver._setResolvedResult('test-string', 'resolved-value')
		const result = await resolver._resolve('test-string')
		expect(result?.value).toBe('resolved-value')
	})
})
