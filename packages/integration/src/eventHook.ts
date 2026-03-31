/**
 * Callback function invoked when an event is triggered on an `EventHook`.
 * @internal
 *
 * @typeParam EventPayload - The type of data passed to the listener when the event fires.
 */
export type EventHookListener<EventPayload> = (payload: EventPayload) => void

/**
 * Lightweight publish-subscribe event hook for internal reactive state notifications.
 * @internal
 *
 * @typeParam EventPayload - The type of data passed to listeners when the event fires.
 *
 * @remarks
 * Used by the integration context to notify build-tool plugins when styles
 * or TypeScript codegen content have changed and need to be regenerated.
 */
export interface EventHook<EventPayload> {
	/** The set of currently registered listener callbacks. */
	listeners: Set<EventHookListener<EventPayload>>
	/** Invokes all registered listeners synchronously with the given payload. No-op when the listener set is empty. */
	trigger: (payload: EventPayload) => void
	/** Registers a listener and returns an unsubscribe function that removes it. */
	on: (listener: EventHookListener<EventPayload>) => () => void
	/** Removes a previously registered listener. No-op if the listener is not registered. */
	off: (listener: EventHookListener<EventPayload>) => void
}

/**
 * Creates a new event hook instance for publish-subscribe event dispatching.
 * @internal
 *
 * @typeParam EventPayload - The type of data passed to listeners when the event fires.
 * @returns A new `EventHook` with an empty listener set.
 *
 * @remarks
 * The returned hook can register listeners via `on`, remove them via `off`,
 * and broadcast payloads to all listeners via `trigger`. Calling `trigger`
 * with no registered listeners is a no-op.
 *
 * @example
 * ```ts
 * const hook = createEventHook<string>()
 * const off = hook.on((msg) => console.log(msg))
 * hook.trigger('hello') // logs "hello"
 * off() // unsubscribes
 * ```
 */
export function createEventHook<EventPayload>(): EventHook<EventPayload> {
	const listeners = new Set<EventHookListener<EventPayload>>()

	function trigger(payload: EventPayload) {
		if (listeners.size === 0)
			return
		listeners.forEach(listener => listener(payload))
	}

	function off(listener: EventHookListener<EventPayload>) {
		listeners.delete(listener)
	}

	function on(listener: EventHookListener<EventPayload>) {
		listeners.add(listener)
		const offListener = () => off(listener)
		return offListener
	}

	return {
		listeners,
		trigger,
		on,
		off,
	}
}
