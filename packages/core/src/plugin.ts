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

function getPluginHook(plugin: EnginePlugin, hook: keyof EngineHooksDefinition) {
	const pluginRecord = plugin as unknown as Record<string, unknown>
	const hookFn = pluginRecord[hook]
	return typeof hookFn === 'function'
		? hookFn as (arg: unknown) => unknown
		: null
}

function applyHookPayload(current: unknown, next: unknown) {
	return next ?? current
}

function logHookStart(kind: 'Sync' | 'Async', hook: keyof EngineHooksDefinition) {
	log.debug(`Executing ${kind.toLowerCase()} hook: ${hook}`)
}

function logHookEnd(kind: 'Sync' | 'Async', hook: keyof EngineHooksDefinition) {
	log.debug(`${kind} hook "${hook}" completed`)
}

function logPluginHookStart(plugin: EnginePlugin, hook: keyof EngineHooksDefinition) {
	log.debug(`  - Plugin "${plugin.name}" executing ${hook}`)
}

function logPluginHookEnd(plugin: EnginePlugin, hook: keyof EngineHooksDefinition) {
	log.debug(`  - Plugin "${plugin.name}" completed ${hook}`)
}

function logPluginHookError(plugin: EnginePlugin, hook: keyof EngineHooksDefinition, error: unknown) {
	log.error(`Plugin "${plugin.name}" failed to execute hook "${hook}": ${error instanceof Error ? error.message : error}`, error)
}

/**
 * Executes an async hook across all plugins in order, piping the payload through each plugin's handler.
 * @internal
 *
 * @typeParam P - The payload/return type flowing through the hook pipeline.
 * @param plugins - The ordered list of engine plugins to execute.
 * @param hook - The name of the async hook to invoke.
 * @param payload - The initial payload to pass into the first plugin.
 * @returns The final payload after all plugins have processed it.
 *
 * @remarks Each plugin's hook receives the current payload and may return a replacement. If a plugin's hook throws, the error is logged and the current payload is preserved for subsequent plugins.
 *
 * @example
 * ```ts
 * const config = await execAsyncHook(plugins, 'configureRawConfig', rawConfig)
 * ```
 */
export async function execAsyncHook<P>(plugins: readonly EnginePlugin[], hook: AsyncHooksNames, payload: P): Promise<P> {
	logHookStart('Async', hook)
	let current: unknown = payload
	for (const plugin of plugins) {
		const hookFn = getPluginHook(plugin, hook)
		if (hookFn == null)
			continue

		try {
			logPluginHookStart(plugin, hook)
			current = applyHookPayload(current, await hookFn(current))
			logPluginHookEnd(plugin, hook)
		}
		catch (error: unknown) {
			logPluginHookError(plugin, hook, error)
		}
	}
	logHookEnd('Async', hook)
	return current as P
}

/**
 * Executes a synchronous hook across all plugins in order, piping the payload through each plugin's handler.
 * @internal
 *
 * @typeParam P - The payload/return type flowing through the hook pipeline.
 * @param plugins - The ordered list of engine plugins to execute.
 * @param hook - The name of the sync hook to invoke.
 * @param payload - The initial payload to pass into the first plugin.
 * @returns The final payload after all plugins have processed it.
 *
 * @remarks Functions identically to `execAsyncHook` but without awaiting. Used for notification-style hooks like `preflightUpdated` or `atomicStyleAdded`.
 *
 * @example
 * ```ts
 * execSyncHook(plugins, 'atomicStyleAdded', atomicStyle)
 * ```
 */
export function execSyncHook<P>(plugins: readonly EnginePlugin[], hook: SyncHooksNames, payload: P): P {
	logHookStart('Sync', hook)
	let current: unknown = payload
	for (const plugin of plugins) {
		const hookFn = getPluginHook(plugin, hook)
		if (hookFn == null)
			continue

		try {
			logPluginHookStart(plugin, hook)
			current = applyHookPayload(current, hookFn(current))
			logPluginHookEnd(plugin, hook)
		}
		catch (error: unknown) {
			logPluginHookError(plugin, hook, error)
		}
	}
	logHookEnd('Sync', hook)
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

/**
 * Pre-built hook dispatcher object mapping each hook name to a function that delegates to `execAsyncHook` or `execSyncHook`.
 * @internal
 *
 * @remarks Provides a convenient, type-safe interface for calling any engine hook by name without manually selecting between `execAsyncHook` and `execSyncHook`. Used throughout the `Engine` class.
 *
 * @example
 * ```ts
 * const config = await hooks.configureRawConfig(plugins, rawConfig)
 * hooks.preflightUpdated(plugins)
 * ```
 */
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

/**
 * Describes an engine plugin that can hook into the PikaCSS engine lifecycle.
 *
 * @remarks Plugins implement optional hook methods corresponding to engine lifecycle events. Hooks run in plugin registration order, optionally reordered by the `order` property.
 *
 * @example
 * ```ts
 * const myPlugin: EnginePlugin = {
 *   name: 'my-plugin',
 *   configureRawConfig: (config) => ({ ...config, important: true }),
 * }
 * ```
 */
export interface EnginePlugin extends EnginePluginHooksOptions {
	/** The unique human-readable name identifying this plugin in logs and diagnostics. */
	name: string
	/**
	 * Controls plugin execution order relative to other plugins.
	 *
	 * @default undefined (normal order)
	 */
	order?: 'pre' | 'post'
}

const orderMap = new Map([
	[void 0, 1],
	['pre', 0],
	['post', 2],
])

/**
 * Sorts an array of plugins by their `order` property: `'pre'` first, default in the middle, `'post'` last.
 * @internal
 *
 * @param plugins - The unordered array of engine plugins.
 * @returns A new array sorted by execution order.
 *
 * @remarks The original array is not mutated. Plugins with the same order retain their relative insertion order (stable sort).
 *
 * @example
 * ```ts
 * const ordered = resolvePlugins([postPlugin, prePlugin, normalPlugin])
 * // [prePlugin, normalPlugin, postPlugin]
 * ```
 */
export function resolvePlugins(plugins: EnginePlugin[]): EnginePlugin[] {
	return [...plugins].sort((a, b) => orderMap.get(a.order)! - orderMap.get(b.order)!)
}

// Only for type inference without runtime effect
/* c8 ignore start */
/**
 * Identity helper that returns the plugin object as-is, providing TypeScript type inference for plugin definitions.
 *
 * @param plugin - The engine plugin definition.
 * @returns The same plugin object, unchanged.
 *
 * @remarks This is a compile-time-only helper; it has no runtime effect. Using it ensures type checking and IDE autocompletion for hook names and payloads.
 *
 * @example
 * ```ts
 * export default defineEnginePlugin({
 *   name: 'my-plugin',
 *   configureRawConfig: (config) => ({ ...config, important: true }),
 * })
 * ```
 */
export function defineEnginePlugin(plugin: EnginePlugin): EnginePlugin {
	return plugin
}
/* c8 ignore end */
