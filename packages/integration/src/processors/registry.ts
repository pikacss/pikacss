import type { FrameworkProcessor, ProcessorLoader, ProcessorRegistry } from './types'
import { jsProcessor } from './js'

/**
 * Creates an empty processor registry.
 *
 * @returns A {@link ProcessorRegistry} with case-insensitive extension keys and memoized lazy loading.
 */
export function createProcessorRegistry(): ProcessorRegistry {
	const loaders = new Map<string, ProcessorLoader>()
	const loaded = new Map<ProcessorLoader, Promise<FrameworkProcessor>>()

	const normalizeExt = (ext: string) => ext.replace(/^\.+/, '')
		.toLowerCase()

	return {
		register(extensions, loader) {
			for (const ext of extensions) {
				loaders.set(normalizeExt(ext), loader)
			}
		},
		resolve(ext) {
			const loader = loaders.get(normalizeExt(ext))
			if (loader == null) {
				return null
			}
			let promise = loaded.get(loader)
			if (promise == null) {
				promise = Promise.resolve(loader())
				loaded.set(loader, promise)
			}
			return promise
		},
		has(ext) {
			return loaders.has(normalizeExt(ext))
		},
	}
}

/**
 * File extensions handled by the built-in JS/TS processor.
 */
export const JS_PROCESSOR_EXTENSIONS = ['js', 'mjs', 'cjs', 'jsx', 'ts', 'mts', 'cts', 'tsx']

/**
 * Creates the default processor registry: the JS/TS processor (static import —
 * it is the hot path) and the Vue SFC processor (lazy — `@vue/compiler-sfc`
 * never loads in non-Vue projects).
 *
 * @returns The default {@link ProcessorRegistry}.
 */
export function createDefaultProcessorRegistry(): ProcessorRegistry {
	const registry = createProcessorRegistry()
	registry.register(JS_PROCESSOR_EXTENSIONS, () => Promise.resolve(jsProcessor))
	registry.register(['vue'], () => import('./vue')
		.then(m => m.vueProcessor))
	return registry
}
