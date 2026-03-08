import type { EventHookListener } from './eventHook'
import { describe, expect, it, vi } from 'vitest'
import { createEventHook } from './eventHook'

describe('createEventHook', () => {
	it('should create an event hook with empty listeners', () => {
		const hook = createEventHook<string>()
		expect(hook.listeners.size)
			.toBe(0)
	})

	it('on() should add listener and return off function', () => {
		const hook = createEventHook<string>()
		const listener = vi.fn()
		const off = hook.on(listener)
		expect(hook.listeners.size)
			.toBe(1)
		expect(hook.listeners.has(listener))
			.toBe(true)
		expect(typeof off)
			.toBe('function')
	})

	it('trigger() should call all listeners with payload', () => {
		const hook = createEventHook<number>()
		const listener1 = vi.fn()
		const listener2 = vi.fn()
		hook.on(listener1)
		hook.on(listener2)
		hook.trigger(42)
		expect(listener1)
			.toHaveBeenCalledWith(42)
		expect(listener2)
			.toHaveBeenCalledWith(42)
	})

	it('trigger() with no listeners should do nothing', () => {
		const hook = createEventHook<string>()
		// Should not throw
		expect(() => hook.trigger('payload')).not.toThrow()
	})

	it('off() should remove listener', () => {
		const hook = createEventHook<string>()
		const listener = vi.fn()
		hook.on(listener)
		expect(hook.listeners.size)
			.toBe(1)
		hook.off(listener)
		expect(hook.listeners.size)
			.toBe(0)
		expect(hook.listeners.has(listener))
			.toBe(false)
	})

	it('off function returned from on() should remove listener', () => {
		const hook = createEventHook<string>()
		const listener = vi.fn()
		const off = hook.on(listener)
		expect(hook.listeners.size)
			.toBe(1)
		off()
		expect(hook.listeners.size)
			.toBe(0)
		expect(hook.listeners.has(listener))
			.toBe(false)
	})

	it('removed listener should not be called on subsequent triggers', () => {
		const hook = createEventHook<string>()
		const listener = vi.fn()
		hook.on(listener)
		hook.off(listener)
		hook.trigger('hello')
		expect(listener).not.toHaveBeenCalled()
	})

	it('multiple listeners should be called in order', () => {
		const hook = createEventHook<void>()
		const order: number[] = []
		const listener1 = vi.fn(() => order.push(1)) as unknown as EventHookListener<void>
		const listener2 = vi.fn(() => order.push(2)) as unknown as EventHookListener<void>
		const listener3 = vi.fn(() => order.push(3)) as unknown as EventHookListener<void>
		hook.on(listener1)
		hook.on(listener2)
		hook.on(listener3)
		hook.trigger(undefined as void)
		expect(order)
			.toEqual([1, 2, 3])
	})

	it('same listener added twice should be deduped (Set behavior)', () => {
		const hook = createEventHook<string>()
		const listener = vi.fn()
		hook.on(listener)
		hook.on(listener)
		expect(hook.listeners.size)
			.toBe(1)
		hook.trigger('test')
		expect(listener)
			.toHaveBeenCalledTimes(1)
	})

	it('listener removal during trigger skips deleted listener not yet visited', () => {
		const hook = createEventHook<string>()
		const listener2 = vi.fn()
		const listener1 = vi.fn(() => {
			// Remove listener2 during trigger (before it's visited)
			hook.off(listener2)
		})
		hook.on(listener1)
		hook.on(listener2)
		hook.trigger('test')
		// Set.forEach skips entries deleted before being visited
		expect(listener1)
			.toHaveBeenCalledWith('test')
		expect(listener2).not.toHaveBeenCalled()
	})

	it('off() with a listener not in the set should not throw', () => {
		const hook = createEventHook<string>()
		const listener = vi.fn()
		expect(() => hook.off(listener)).not.toThrow()
		expect(hook.listeners.size)
			.toBe(0)
	})

	it('trigger() should remain synchronous when listeners schedule async work', async () => {
		const hook = createEventHook<number>()
		const results: number[] = []
		const listener = (payload: number) => {
			void Promise.resolve()
				.then(() => {
					results.push(payload * 2)
				})
		}
		hook.on(listener)
		hook.trigger(5)
		expect(results)
			.toEqual([])
		await Promise.resolve()
		expect(results)
			.toEqual([10])
	})

	it('off function from on() should be idempotent', () => {
		const hook = createEventHook<string>()
		const listener = vi.fn()
		const off = hook.on(listener)
		off()
		off() // calling off again should not throw
		expect(hook.listeners.size)
			.toBe(0)
	})
})
