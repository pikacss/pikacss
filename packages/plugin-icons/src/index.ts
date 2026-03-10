import type { CustomCollections, IconCustomizations, IconifyLoaderOptions } from '@iconify/utils'
import type { Engine, EnginePlugin, StyleItem } from '@pikacss/core'
import process from 'node:process'
import { encodeSvgForCss, loadIcon, quicklyValidateIconSet, searchForIcon, stringToIcon } from '@iconify/utils'
import { loadNodeIcon } from '@iconify/utils/lib/loader/node-loader'
import { defineEnginePlugin, log } from '@pikacss/core'
import { $fetch } from 'ofetch'

/**
 * Environment flags helper function to detect the current runtime environment.
 */
function getEnvFlags() {
	const isNode = typeof process !== 'undefined' && typeof process.versions?.node !== 'undefined'
	const isVSCode = isNode && !!process.env.VSCODE_PID
	const isESLint = isNode && !!process.env.ESLINT
	return { isNode, isVSCode, isESLint }
}

interface IconMeta {
	collection: string
	name: string
	svg: string
	source: IconSource
	mode?: IconsConfig['mode']
}

type IconSource = 'custom' | 'local' | 'cdn'
type ValidatedIconSet = NonNullable<ReturnType<typeof quicklyValidateIconSet>>

export interface IconsConfig {
	/**
	 * Class name prefix for icon shortcuts.
	 *
	 * @default 'i-'
	 */
	prefix?: string | string[]

	/**
	 * Default rendering mode.
	 *
	 * @default 'auto'
	 */
	mode?: 'auto' | 'mask' | 'bg'

	/**
	 * Scale icons against 1em.
	 *
	 * @default 1
	 */
	scale?: number

	/**
	 * Native Iconify custom collections.
	 */
	collections?: CustomCollections

	/**
	 * Native Iconify SVG customizations.
	 */
	customizations?: IconCustomizations

	/**
	 * Auto install missing Iconify JSON packages when supported by the runtime.
	 *
	 * @default false
	 */
	autoInstall?: IconifyLoaderOptions['autoInstall']

	/**
	 * Current working directory used to resolve local Iconify JSON packages.
	 *
	 * @default process.cwd()
	 */
	cwd?: IconifyLoaderOptions['cwd']

	/**
	 * Optional CDN base URL or URL template for collection JSON.
	 * Use `{collection}` as a placeholder to fully control the final URL.
	 */
	cdn?: string

	/**
	 * CSS unit used when width or height need to be synthesized.
	 */
	unit?: string

	/**
	 * Additional CSS properties applied to every resolved icon.
	 */
	extraProperties?: Record<string, string>

	/**
	 * Processor for the CSS object before stringify
	 */
	processor?: (styleItem: StyleItem, meta: Required<IconMeta>) => void

	/**
	 * Specify the icons for auto-completion.
	 */
	autocomplete?: string[]
}

declare module '@pikacss/core' {
	interface EngineConfig {
		icons?: IconsConfig
	}
}

export function icons(): EnginePlugin {
	return createIconsPlugin()
}

const globalColonRE = /:/g
const currentColorRE = /currentColor/

function normalizePrefixes(prefix: IconsConfig['prefix']) {
	const prefixes = [prefix ?? 'i-'].flat()
		.filter(Boolean)
	return [...new Set(prefixes)]
}

function escapeRegExp(value: string) {
	return value.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&')
}

function createShortcutRegExp(prefixes: string[]) {
	return new RegExp(`^(?:${prefixes.map(escapeRegExp)
		.join('|')})([\\w:-]+)(?:\\?(mask|bg|auto))?$`)
}

function getPossibleIconNames(iconName: string) {
	return [
		iconName,
		iconName.replace(/([a-z])([A-Z])/g, '$1-$2')
			.toLowerCase(),
		iconName.replace(/([a-z])(\d+)/g, '$1-$2'),
	]
}

function createAutocomplete(prefixes: string[], autocomplete: string[] = []) {
	const prefixRE = new RegExp(`^(?:${prefixes.map(escapeRegExp)
		.join('|')})`)
	return [
		...prefixes,
		...prefixes.flatMap(prefix => autocomplete.map(icon => `${prefix}${icon.replace(prefixRE, '')}`)),
	]
}

function resolveCdnCollectionUrl(cdn: string, collection: string) {
	if (cdn.includes('{collection}'))
		return cdn.replaceAll('{collection}', collection)
	return `${cdn.replace(/\/$/, '')}/${collection}.json`
}

function createLoaderOptions(config: IconsConfig, usedProps?: Record<string, string>): IconifyLoaderOptions {
	const {
		scale = 1,
		collections,
		autoInstall = false,
		cwd,
		unit,
		extraProperties = {},
		customizations = {},
	} = config

	const iconCustomizer = customizations.iconCustomizer

	return {
		addXmlNs: true,
		scale,
		customCollections: collections,
		autoInstall,
		cwd,
		usedProps,
		customizations: {
			...customizations,
			additionalProps: {
				...customizations.additionalProps,
				...extraProperties,
			},
			trimCustomSvg: customizations.trimCustomSvg ?? true,
			async iconCustomizer(collection, icon, props) {
				await iconCustomizer?.(collection, icon, props)
				if (unit) {
					if (!props.width)
						props.width = `${scale}${unit}`
					if (!props.height)
						props.height = `${scale}${unit}`
				}
			},
		},
	}
}

async function loadCollectionFromCdn(cdn: string, collection: string, cache: Map<string, Promise<ValidatedIconSet | undefined>>) {
	if (!cache.has(collection)) {
		cache.set(collection, (async () => {
			try {
				const response = await $fetch<unknown>(resolveCdnCollectionUrl(cdn, collection))
				return quicklyValidateIconSet(response) ?? undefined
			}
			catch {
				return undefined
			}
		})())
	}

	return cache.get(collection)!
}

async function resolveIcon(body: string, config: IconsConfig, flags: ReturnType<typeof getEnvFlags>, cdnCollectionCache: Map<string, Promise<ValidatedIconSet | undefined>>) {
	const parsed = stringToIcon(body, true)
	if (parsed == null || !parsed.prefix)
		return null

	const customProps: Record<string, string> = {}
	const customSvg = await loadIcon(parsed.prefix, parsed.name, createLoaderOptions(config, customProps))
	if (customSvg != null) {
		return {
			collection: parsed.prefix,
			name: parsed.name,
			svg: customSvg,
			usedProps: customProps,
			source: 'custom' as const,
		}
	}

	if (flags.isNode && !flags.isVSCode && !flags.isESLint) {
		const localProps: Record<string, string> = {}
		const localSvg = await loadNodeIcon(parsed.prefix, parsed.name, {
			...createLoaderOptions(config, localProps),
			customCollections: undefined,
		})
		if (localSvg != null) {
			return {
				collection: parsed.prefix,
				name: parsed.name,
				svg: localSvg,
				usedProps: localProps,
				source: 'local' as const,
			}
		}
	}

	if (config.cdn) {
		const iconSet = await loadCollectionFromCdn(config.cdn, parsed.prefix, cdnCollectionCache)
		if (iconSet != null) {
			const remoteProps: Record<string, string> = {}
			const remoteSvg = await searchForIcon(
				iconSet,
				parsed.prefix,
				getPossibleIconNames(parsed.name),
				createLoaderOptions(config, remoteProps),
			)
			if (remoteSvg != null) {
				return {
					collection: parsed.prefix,
					name: parsed.name,
					svg: remoteSvg,
					usedProps: remoteProps,
					source: 'cdn' as const,
				}
			}
		}
	}

	return {
		collection: parsed.prefix,
		name: parsed.name,
		svg: null,
		usedProps: {},
		source: null,
	}
}

function createIconsPlugin(): EnginePlugin {
	let engine: Engine
	let iconsConfig: IconsConfig = {}
	const flags = getEnvFlags()
	const cdnCollectionCache = new Map<string, Promise<ValidatedIconSet | undefined>>()

	return defineEnginePlugin({
		name: 'icons',

		configureRawConfig: async (config) => {
			iconsConfig = config.icons || {}
		},

		configureEngine: async (_engine) => {
			engine = _engine
			const {
				mode = 'auto',
				prefix = 'i-',
				processor,
				autocomplete: _autocomplete,
			} = iconsConfig
			const prefixes = normalizePrefixes(prefix)
			const autocomplete = createAutocomplete(prefixes, _autocomplete)

			engine.shortcuts.add({
				shortcut: createShortcutRegExp(prefixes),
				value: async (match) => {
					let [full, body, _mode = mode] = match as [string, string, IconsConfig['mode']]
					const resolved = await resolveIcon(body, iconsConfig, flags, cdnCollectionCache)

					if (resolved == null) {
						log.warn(`invalid icon name "${full}"`)
						return {}
					}

					if (resolved.svg == null) {
						log.warn(`failed to load icon "${full}"`)
						return {}
					}

					const url = `url("data:image/svg+xml;utf8,${encodeSvgForCss(resolved.svg)}")`
					const varName = `--${engine.config.prefix}svg-icon-${body.replace(globalColonRE, '-')}`
					if (engine.variables.store.has(varName) === false) {
						engine.variables.add({
							[varName]: {
								value: url,
								autocomplete: { asValueOf: '-', asProperty: false },
								pruneUnused: true,
							},
						})
					}

					if (_mode === 'auto')
						_mode = currentColorRE.test(resolved.svg) ? 'mask' : 'bg'

					let styleItem: StyleItem

					if (_mode === 'mask') {
						// Thanks to https://codepen.io/noahblon/post/coloring-svgs-in-css-background-images
						styleItem = {
							'--svg-icon': `var(${varName})`,
							'-webkit-mask': 'var(--svg-icon) no-repeat',
							'mask': 'var(--svg-icon) no-repeat',
							'-webkit-mask-size': '100% 100%',
							'mask-size': '100% 100%',
							'background-color': 'currentColor',
							// for Safari https://github.com/elk-zone/elk/pull/264
							'color': 'inherit',
							...resolved.usedProps,
						}
					}
					else {
						styleItem = {
							'--svg-icon': `var(${varName})`,
							'background': 'var(--svg-icon) no-repeat',
							'background-size': '100% 100%',
							'background-color': 'transparent',
							...resolved.usedProps,
						}
					}

					processor?.(
						styleItem,
						{
							collection: resolved.collection,
							name: resolved.name,
							svg: resolved.svg,
							source: resolved.source,
							mode: _mode,
						},
					)

					return styleItem
				},
				autocomplete,
			})
		},
	})
}
