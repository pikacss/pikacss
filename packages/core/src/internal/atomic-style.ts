import type { AtomicStyle, ExtractedStyleContent, StyleContent } from './types'
import { hasPropertyEffectOverlap } from './property-effects'
import { log, numberToChars, serialize } from './utils'

export interface EngineStore {
	atomicStyleIds: Map<string, string>
	atomicStyles: Map<string, AtomicStyle>
	atomicStyleIdsByBaseKey: Map<string, string[]>
	atomicStyleOrder: Map<string, number>
}

interface AtomicStyleResolution {
	id: string
	atomicStyle?: AtomicStyle
}

export function createEngineStore(): EngineStore {
	return {
		atomicStyleIds: new Map<string, string>(),
		atomicStyles: new Map<string, AtomicStyle>(),
		atomicStyleIdsByBaseKey: new Map<string, string[]>(),
		atomicStyleOrder: new Map<string, number>(),
	}
}

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
		if (dependencyKeys.length > 0) {
			nextContent.orderSensitive = true
			nextContent.orderSensitiveTo = dependencyKeys
		}

		map.set(key, nextContent)
		scoped.set(key, nextContent)
	})
	return [...map.values()]
}

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
	return content.orderSensitive === true
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
		dependencyKeys: content.orderSensitiveTo ?? [],
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
