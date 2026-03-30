import { describe, expect, it, vi } from 'vitest'

import { createEventHook } from './eventHook'

describe('createEventHook', () => {
	it('starts empty and ignores trigger calls when no listeners are registered', () => {
		const hook = createEventHook<string>()

		expect(hook.listeners.size)
			.toBe(0)

		expect(() => hook.trigger('ready'))
			.not.toThrow()
	})

	it('registers listeners, triggers them synchronously, and removes them through the returned disposer', () => {
		const hook = createEventHook<string>()
		const first = vi.fn()
		const second = vi.fn()

		const offFirst = hook.on(first)
		hook.on(second)
		hook.trigger('before-off')
		offFirst()
		hook.trigger('after-off')

		expect(first)
			.toHaveBeenCalledTimes(1)
		expect(first)
			.toHaveBeenCalledWith('before-off')
		expect(second)
			.toHaveBeenCalledTimes(2)
		expect(second)
			.toHaveBeenNthCalledWith(1, 'before-off')
		expect(second)
			.toHaveBeenNthCalledWith(2, 'after-off')
		expect(hook.listeners.size)
			.toBe(1)
	})

	it('supports explicit off calls without affecting unrelated listeners', () => {
		const hook = createEventHook<number>()
		const kept = vi.fn()
		const removed = vi.fn()

		hook.on(kept)
		hook.on(removed)
		hook.off(removed)
		hook.trigger(2)

		expect(kept)
			.toHaveBeenCalledWith(2)
		expect(removed)
			.not.toHaveBeenCalled()
	})
})
