import type { Engine } from './engine'
import type { AtomicStyle, Awaitable, EngineConfig, ResolvedEngineConfig, ResolvedStyleDefinition, ResolvedStyleItem } from './types'
import { log } from './utils'

type DefineHooks<Hooks extends Record<string, [type: 'sync' | 'async', payload: unknown, returnValue?: unknown]>> = Hooks

type EngineHooksDefinition = DefineHooks<{
	configureRawConfig: ['async', config: EngineConfig]
	rawConfigConfigured: ['sync', config: EngineConfig, void]
	configureResolvedConfig: ['async', resolvedConfig: ResolvedEngineConfig]
	configureEngine: ['async', engine: Engine]
	transformSelectors: ['async', selectors: string[]]
	transformStyleItems: ['async', styleItems: ResolvedStyleItem[]]
	transformStyleDefinitions: ['async', styleDefinitions: ResolvedStyleDefinition[]]
	preflightUpdated: ['sync', void]
	atomicStyleAdded: ['sync', AtomicStyle]
	autocompleteConfigUpdated: ['sync', void]
}>

type GetHooksNames<
	T extends 'sync' | 'async',
	K extends keyof EngineHooksDefinition = keyof EngineHooksDefinition,
> = K extends keyof EngineHooksDefinition ? EngineHooksDefinition[K][0] extends T ? K : never : never

type SyncHooksNames = GetHooksNames<'sync'>
type AsyncHooksNames = GetHooksNames<'async'>

export async function execAsyncHook<P>(plugins: readonly EnginePlugin[], hook: AsyncHooksNames, payload: P): Promise<P> {
	log.debug(`Executing async hook: ${hook}`)
	let current: unknown = payload
	for (const plugin of plugins) {
		const pluginRecord = plugin as unknown as Record<string, unknown>
		if (pluginRecord[hook] == null)
			continue

		try {
			log.debug(`  - Plugin "${plugin.name}" executing ${hook}`)
			const hookFn = pluginRecord[hook] as (arg: unknown) => unknown
			const newPayload = await hookFn(current)
			if (newPayload != null)
				current = newPayload
			log.debug(`  - Plugin "${plugin.name}" completed ${hook}`)
		}
		catch (error: unknown) {
			log.error(`Plugin "${plugin.name}" failed to execute hook "${hook}": ${error instanceof Error ? error.message : error}`, error)
		}
	}
	log.debug(`Async hook "${hook}" completed`)
	return current as P
}

export function execSyncHook<P>(plugins: readonly EnginePlugin[], hook: SyncHooksNames, payload: P): P {
	log.debug(`Executing sync hook: ${hook}`)
	let current: unknown = payload
	for (const plugin of plugins) {
		const pluginRecord = plugin as unknown as Record<string, unknown>
		if (pluginRecord[hook] == null)
			continue

		try {
			log.debug(`  - Plugin "${plugin.name}" executing ${hook}`)
			const hookFn = pluginRecord[hook] as (arg: unknown) => unknown
			const newPayload = hookFn(current)
			if (newPayload != null)
				current = newPayload
			log.debug(`  - Plugin "${plugin.name}" completed ${hook}`)
		}
		catch (error: unknown) {
			log.error(`Plugin "${plugin.name}" failed to execute hook "${hook}": ${error instanceof Error ? error.message : error}`, error)
		}
	}
	log.debug(`Sync hook "${hook}" completed`)
	return current as P
}

type HookParams<H extends [type: 'sync' | 'async', payload: any, returnValue?: any]>
	= H[1] extends void ? [] : [payload: H[1]]

type HookReturnType<H extends [type: 'sync' | 'async', payload: any, returnValue?: any]>
	= H extends [any, any, infer R]
		? H[0] extends 'async' ? Promise<R> : R
		: H[0] extends 'async' ? Promise<H[1]> : H[1]

type EngineHooks = {
	[K in keyof EngineHooksDefinition]: (
		plugins: EnginePlugin[],
		...params: HookParams<EngineHooksDefinition[K]>
	) => HookReturnType<EngineHooksDefinition[K]>
}

export const hooks: EngineHooks = {
	configureRawConfig: (plugins: EnginePlugin[], config: EngineConfig) =>
		execAsyncHook(plugins, 'configureRawConfig', config),
	rawConfigConfigured: (plugins: EnginePlugin[], config: EngineConfig) =>
		execSyncHook(plugins, 'rawConfigConfigured', config),
	configureResolvedConfig: (plugins: EnginePlugin[], resolvedConfig: ResolvedEngineConfig) =>
		execAsyncHook(plugins, 'configureResolvedConfig', resolvedConfig),
	configureEngine: (plugins: EnginePlugin[], engine: Engine) =>
		execAsyncHook(plugins, 'configureEngine', engine),
	transformSelectors: (plugins: EnginePlugin[], selectors: string[]) =>
		execAsyncHook(plugins, 'transformSelectors', selectors),
	transformStyleItems: (plugins: EnginePlugin[], styleItems: ResolvedStyleItem[]) =>
		execAsyncHook(plugins, 'transformStyleItems', styleItems),
	transformStyleDefinitions: (plugins: EnginePlugin[], styleDefinitions: ResolvedStyleDefinition[]) =>
		execAsyncHook(plugins, 'transformStyleDefinitions', styleDefinitions),
	preflightUpdated: (plugins: EnginePlugin[]) =>
		execSyncHook(plugins, 'preflightUpdated', void 0),
	atomicStyleAdded: (plugins: EnginePlugin[], atomicStyle: AtomicStyle) =>
		execSyncHook(plugins, 'atomicStyleAdded', atomicStyle),
	autocompleteConfigUpdated: (plugins: EnginePlugin[]) =>
		execSyncHook(plugins, 'autocompleteConfigUpdated', void 0),
}

type EnginePluginHooksOptions = {
	[K in keyof EngineHooksDefinition]?: EngineHooksDefinition[K][0] extends 'async'
		? (...params: HookParams<EngineHooksDefinition[K]>) => Awaitable<EngineHooksDefinition[K][1] | void>
		: (...params: HookParams<EngineHooksDefinition[K]>) => EngineHooksDefinition[K][1] | void
}

export interface EnginePlugin extends EnginePluginHooksOptions {
	name: string
	order?: 'pre' | 'post'
}

const orderMap = new Map([
	[void 0, 1],
	['pre', 0],
	['post', 2],
])

export function resolvePlugins(plugins: EnginePlugin[]): EnginePlugin[] {
	return [...plugins].sort((a, b) => orderMap.get(a.order)! - orderMap.get(b.order)!)
}

// Only for type inference without runtime effect
/* c8 ignore start */
export function defineEnginePlugin(plugin: EnginePlugin): EnginePlugin {
	return plugin
}
/* c8 ignore end */
