import type { AtomicStyle, ExtractedStyleContent, StyleContent } from './types'
import { hasPropertyEffectOverlap } from './property-effects'
import { log, numberToChars, serialize } from './utils'

/**
 * Mutable store holding all resolved atomic styles and their lookup indices for an engine instance.
 * @internal
 *
 * @remarks The store is created once per engine and mutated as new styles are resolved via `engine.use()`. It maintains four related indices: content-hash to ID, ID to full atomic style, base-key to ID list (for order-sensitive reuse), and ID to insertion order.
 *
 * @example
 * ```ts
 * const store = createEngineStore()
 * // store.atomicStyleIds: Map<serializedKey, 'pk-a'>
 * ```
 */
export interface EngineStore {
	/** Map from serialized content keys to their assigned atomic style IDs. */
	atomicStyleIds: Map<string, string>
	/** Map from atomic style ID to the full `AtomicStyle` object. */
	atomicStyles: Map<string, AtomicStyle>
	/** Map from base content key to the list of atomic style IDs that share it (for order-sensitive styles). */
	atomicStyleIdsByBaseKey: Map<string, string[]>
	/** Map from atomic style ID to its insertion order index, used for deterministic output ordering. */
	atomicStyleOrder: Map<string, number>
}

interface AtomicStyleResolution {
	id: string
	atomicStyle?: AtomicStyle
}

/**
 * Creates a fresh, empty `EngineStore` with all maps initialized.
 * @internal
 *
 * @returns A new `EngineStore` instance with empty maps.
 *
 * @remarks Called once during engine construction. Each engine instance owns a single store.
 *
 * @example
 * ```ts
 * const store = createEngineStore()
 * store.atomicStyles.size // 0
 * ```
 */
export function createEngineStore(): EngineStore {
	return {
		atomicStyleIds: new Map<string, string>(),
		atomicStyles: new Map<string, AtomicStyle>(),
		atomicStyleIdsByBaseKey: new Map<string, string[]>(),
		atomicStyleOrder: new Map<string, number>(),
	}
}

/**
 * Assigns or retrieves a compact atomic style ID for the given resolved style content.
 * @internal
 *
 * @param options - Object containing the style `content`, the engine `prefix`, and the `stored` ID map.
 * @returns The short alphabetic ID string (e.g. `'pk-a'`, `'pk-bA'`).
 *
 * @remarks For non-order-sensitive content, returns a cached ID if one already exists for the same base key. For order-sensitive content (where `orderSensitiveTo` is set), always generates a new ID to prevent incorrect reuse across different call-site orderings.
 *
 * @example
 * ```ts
 * const id = getAtomicStyleId({ content, prefix: 'pk-', stored: store.atomicStyleIds })
 * // 'pk-a'
 * ```
 */
export function getAtomicStyleId({
	content,
	prefix,
	stored,
}: {
	content: StyleContent
	prefix: string
	stored: Map<string, string>
}) {
	const baseKey = getAtomicStyleBaseKey(content)
	if (isOrderSensitiveContent(content) === false) {
		const cached = stored.get(baseKey)
		if (cached != null) {
			log.debug(`Atomic style cached: ${cached}`)
			return cached
		}
	}

	const num = stored.size
	const id = `${prefix}${numberToChars(num)}`
	const key = getAtomicStyleStoredKey({ content, baseKey, num })
	stored.set(key, id)
	log.debug(`Generated new atomic style ID: ${id}`)
	return id
}

/**
 * Resolves a `StyleContent` into an atomic style: either reusing an existing ID or creating a new `AtomicStyle` entry in the store.
 * @internal
 *
 * @param options - Object containing the style `content`, `prefix`, `store`, and the per-use-call `resolvedIdsByBaseKey` map for order-sensitive reuse tracking.
 * @returns An `AtomicStyleResolution` with the assigned `id` and optionally the newly created `atomicStyle` (absent when the ID was already registered).
 *
 * @remarks First checks for reusable order-sensitive IDs within the current `engine.use()` call, then falls back to `getAtomicStyleId` for general ID assignment. When a new atomic style is created, it is registered in all store indices.\n *\n * @example\n * ```ts\n * const { id, atomicStyle } = resolveAtomicStyle({\n *   content, prefix: 'pk-', store, resolvedIdsByBaseKey,\n * })\n * ```\n
 */
export function resolveAtomicStyle({
	content,
	prefix,
	store,
	resolvedIdsByBaseKey,
}: {
	content: StyleContent
	prefix: string
	store: EngineStore
	resolvedIdsByBaseKey: Map<string, string>
}): AtomicStyleResolution {
	const reusableId = findReusableOrderSensitiveAtomicStyleId({
		content,
		store,
		resolvedIdsByBaseKey,
	})
	if (reusableId != null) {
		log.debug(`Order-sensitive atomic style reused: ${reusableId}`)
		return { id: reusableId }
	}

	const id = getAtomicStyleId({
		content,
		prefix,
		stored: store.atomicStyleIds,
	})
	if (store.atomicStyles.has(id))
		return { id }

	const atomicStyle: AtomicStyle = { id, content }
	registerAtomicStyle(store, atomicStyle)
	return { id, atomicStyle }
}

/**
 * Deduplicates and optimizes a list of extracted style contents by merging duplicate selector-property pairs and detecting order-sensitive shorthand overlaps.
 * @internal
 *\n * @param list - The raw extracted style contents to optimize.\n * @returns An optimized array of `StyleContent` entries with nullish-value removals applied and `orderSensitiveTo` metadata attached where needed.\n *\n * @remarks Later definitions of the same selector-property pair cancel earlier ones. When two properties in the same scope share overlapping CSS effects (e.g. `margin` and `margin-top`), the later one is marked as order-sensitive to prevent incorrect ID reuse.\n *\n * @example\n * ```ts\n * const optimized = optimizeAtomicStyleContents(extractedList)\n * ```\n
 */
export function optimizeAtomicStyleContents(list: ExtractedStyleContent[]) {
	const map = new Map<string, StyleContent>()
	const scopedEntries = new Map<string, Map<string, StyleContent>>()
	list.forEach((content) => {
		const scopeKey = serialize(content.selector)
		const key = serialize([content.selector, content.property])
		const scoped = scopedEntries.get(scopeKey) || new Map<string, StyleContent>()
		scopedEntries.set(scopeKey, scoped)

		map.delete(key)
		scoped.delete(key)

		if (content.value == null)
			return

		const { selector, property, value } = content
		const nextContent: StyleContent = { selector, property, value }
		const dependencyKeys = getOrderSensitiveDependencyKeys(scoped, property)
		if (dependencyKeys.length > 0)
			nextContent.orderSensitiveTo = dependencyKeys

		map.set(key, nextContent)
		scoped.set(key, nextContent)
	})
	return [...map.values()]
}

/**
 * Computes the base cache key for an atomic style from its selector, property, and value.
 * @internal
 *
 * @param content - An object with `selector`, `property`, and `value` fields.
 * @returns A deterministic serialized string key.
 *
 * @remarks Used for deduplication: two atomic styles with the same base key are considered equivalent (unless order-sensitive). The key is derived by serializing the triple `[selector, property, value]`.
 *
 * @example
 * ```ts
 * const key = getAtomicStyleBaseKey({ selector: ['.pk-__ID__'], property: 'color', value: ['red'] })
 * ```
 */
export function getAtomicStyleBaseKey(content: Pick<StyleContent, 'selector' | 'property' | 'value'>) {
	return serialize([content.selector, content.property, content.value])
}

function getAtomicStyleStoredKey({
	content,
	baseKey,
	num,
}: {
	content: StyleContent
	baseKey: string
	num: number
}) {
	return isOrderSensitiveContent(content)
		? serialize([baseKey, 'order-sensitive', num])
		: baseKey
}

function isOrderSensitiveContent(content: StyleContent) {
	return (content.orderSensitiveTo?.length ?? 0) > 0
}

function registerAtomicStyle(
	store: EngineStore,
	atomicStyle: AtomicStyle,
) {
	const { id, content } = atomicStyle
	const baseKey = getAtomicStyleBaseKey(content)
	store.atomicStyleOrder.set(id, store.atomicStyles.size)
	store.atomicStyles.set(id, atomicStyle)
	const ids = store.atomicStyleIdsByBaseKey.get(baseKey)
	if (ids == null)
		store.atomicStyleIdsByBaseKey.set(baseKey, [id])
	else
		ids.push(id)
}

function getRequiredAtomicStyleOrder({
	dependencyKeys,
	store,
	resolvedIdsByBaseKey,
}: {
	dependencyKeys: string[]
	store: EngineStore
	resolvedIdsByBaseKey: Map<string, string>
}) {
	let requiredOrder = -1
	for (const dependencyKey of dependencyKeys) {
		const dependencyId = resolvedIdsByBaseKey.get(dependencyKey)
			?? store.atomicStyleIds.get(dependencyKey)
		if (dependencyId == null)
			continue
		const dependencyOrder = store.atomicStyleOrder.get(dependencyId)
		if (dependencyOrder != null)
			requiredOrder = Math.max(requiredOrder, dependencyOrder)
	}
	return requiredOrder
}

function findReusableOrderSensitiveAtomicStyleId({
	content,
	store,
	resolvedIdsByBaseKey,
}: {
	content: StyleContent
	store: EngineStore
	resolvedIdsByBaseKey: Map<string, string>
}) {
	if (isOrderSensitiveContent(content) === false)
		return undefined

	const baseKey = getAtomicStyleBaseKey(content)
	const requiredOrder = getRequiredAtomicStyleOrder({
		dependencyKeys: content.orderSensitiveTo!,
		store,
		resolvedIdsByBaseKey,
	})
	return (store.atomicStyleIdsByBaseKey.get(baseKey) ?? [])
		.find((candidateId) => {
			const candidateOrder = store.atomicStyleOrder.get(candidateId)
			return candidateOrder != null && candidateOrder > requiredOrder
		})
}

function getOrderSensitiveDependencyKeys(scoped: Map<string, StyleContent>, property: string) {
	const dependencyKeys: string[] = []
	for (const existing of scoped.values()) {
		if (hasPropertyEffectOverlap(existing.property, property))
			dependencyKeys.push(getAtomicStyleBaseKey(existing))
	}
	return dependencyKeys
}
