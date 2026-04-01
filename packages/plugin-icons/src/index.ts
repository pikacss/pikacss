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

const RE_ESCAPE_REGEXP = /[|\\{}()[\]^$+*?.-]/g
const RE_CAMEL_CASE_ICON_BOUNDARY = /([a-z])([A-Z])/g
const RE_DIGIT_ICON_BOUNDARY = /([a-z])(\d+)/g
const RE_TRAILING_SLASH = /\/$/

/**
 * Configuration options for the PikaCSS icons plugin.
 *
 * @remarks Controls how icon utilities are resolved, loaded, and rendered as CSS.
 * Icons are loaded from custom collections first, then from locally installed
 * Iconify packages, and finally from a CDN if configured.
 *
 * @example
 * ```ts
 * import { defineEngineConfig } from '@pikacss/core'
 * import { icons } from '@pikacss/plugin-icons'
 *
 * export default defineEngineConfig({
 *   plugins: [icons()],
 *   icons: {
 *     prefix: 'i-',
 *     mode: 'auto',
 *     scale: 1,
 *     cdn: 'https://esm.sh/@iconify-json/{collection}/icons.json',
 *   },
 * })
 * ```
 */
export interface IconsConfig {
	/**
	 * One or more prefixes used to match icon utility names. When a utility
	 * matches `<prefix><collection>:<name>`, it resolves to an icon style.
	 *
	 * @default `'i-'`
	 */
	prefix?: string | string[]

	/**
	 * Rendering strategy for icon SVGs. `'mask'` uses a CSS mask with
	 * `currentColor` as the fill, allowing color inheritance. `'bg'` renders
	 * the SVG as a background image with its original colors. `'auto'`
	 * chooses `'mask'` when the SVG contains `currentColor`, otherwise `'bg'`.
	 *
	 * @default `'auto'`
	 */
	mode?: 'auto' | 'mask' | 'bg'

	/**
	 * Multiplier applied to the icon's intrinsic width and height.
	 * Combined with `unit` to produce the final CSS dimensions.
	 *
	 * @default `1`
	 */
	scale?: number

	/**
	 * Custom icon collections keyed by collection name. Each entry maps
	 * icon names to SVG strings or async loaders, checked before local
	 * packages and the CDN.
	 *
	 * @default `undefined`
	 */
	collections?: CustomCollections

	/**
	 * Iconify customization hooks applied when loading icons. Allows
	 * transforming SVG attributes, trimming whitespace, and running
	 * per-icon logic via `iconCustomizer`.
	 *
	 * @default `{}`
	 */
	customizations?: IconCustomizations

	/**
	 * When enabled, automatically installs missing `@iconify-json/*`
	 * packages on demand during local icon resolution.
	 *
	 * @default `false`
	 */
	autoInstall?: IconifyLoaderOptions['autoInstall']

	/**
	 * Working directory used by the Iconify node loader when resolving
	 * locally installed icon packages.
	 *
	 * @default `undefined`
	 */
	cwd?: IconifyLoaderOptions['cwd']

	/**
	 * CDN URL template for fetching remote icon sets. Use `{collection}`
	 * as a placeholder for the collection name, or provide a base URL
	 * and the collection name will be appended as `<url>/<collection>.json`.
	 *
	 * @default `undefined`
	 */
	cdn?: string

	/**
	 * CSS unit appended to the icon's width and height (e.g. `'em'`, `'rem'`).
	 * When set, produces explicit dimension values like `1em` based on `scale`.
	 * When omitted, dimensions are left to the SVG's intrinsic size.
	 *
	 * @default `undefined`
	 */
	unit?: string

	/**
	 * Additional CSS properties merged into every generated icon style item.
	 * Useful for adding `display`, `vertical-align`, or other layout properties.
	 *
	 * @default `{}`
	 */
	extraProperties?: Record<string, string>

	/**
	 * Post-processing callback invoked on each generated icon style item before
	 * it is returned. Receives the mutable style item and resolved icon metadata,
	 * allowing custom property injection or conditional transformations.
	 *
	 * @default `undefined`
	 */
	processor?: (styleItem: StyleItem, meta: Required<IconMeta>) => void

	/**
	 * Explicit list of icon identifiers (e.g. `'mdi:home'`) to include in
	 * editor autocomplete suggestions. Each entry is combined with every
	 * configured prefix.
	 *
	 * @default `undefined`
	 */
	autocomplete?: string[]
}

declare module '@pikacss/core' {
	interface EngineConfig {
		/**
		 * Configuration for the icons plugin. Requires the `icons()` plugin
		 * to be registered in `plugins` for this configuration to take effect.
		 *
		 * @default `undefined`
		 */
		icons?: IconsConfig
	}
}

/**
 * Creates the PikaCSS icons engine plugin.
 *
 * @returns An engine plugin that registers icon shortcut rules and autocomplete entries.
 *
 * @remarks Resolves icon SVGs from custom collections, locally installed
 * `@iconify-json/*` packages, or a remote CDN. Each matched utility is
 * expanded into a CSS style item using either mask or background rendering.
 * Configure behavior through the `icons` key in your engine config.
 *
 * @example
 * ```ts
 * import { icons } from '@pikacss/plugin-icons'
 *
 * export default defineEngineConfig({
 *   plugins: [icons()],
 *   icons: { prefix: 'i-', mode: 'auto' },
 * })
 * ```
 */
export function icons(): EnginePlugin {
	return createIconsPlugin()
}

const globalColonRE = /:/g
const currentColorRE = /currentColor/

function normalizePrefixes(prefix: Exclude<IconsConfig['prefix'], undefined>) {
	const prefixes = [prefix].flat()
		.filter(Boolean)
	return [...new Set(prefixes)]
}

function escapeRegExp(value: string) {
	return value.replace(RE_ESCAPE_REGEXP, '\\$&')
}

function createShortcutRegExp(prefixes: string[]) {
	return new RegExp(`^(?:${prefixes.map(escapeRegExp)
		.join('|')})([\\w:-]+)(?:\\?(mask|bg|auto))?$`)
}

function getPossibleIconNames(iconName: string) {
	return [
		iconName,
		iconName.replace(RE_CAMEL_CASE_ICON_BOUNDARY, '$1-$2')
			.toLowerCase(),
		iconName.replace(RE_DIGIT_ICON_BOUNDARY, '$1-$2'),
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

function createAutocompletePatterns(prefixes: string[]) {
	return prefixes.flatMap(prefix => [
		`\`${prefix}\${string}:\${string}\``,
		`\`${prefix}\${string}:\${string}?mask\``,
		`\`${prefix}\${string}:\${string}?bg\``,
		`\`${prefix}\${string}:\${string}?auto\``,
	])
}

function resolveCdnCollectionUrl(cdn: string, collection: string) {
	if (cdn.includes('{collection}'))
		return cdn.replaceAll('{collection}', collection)
	return `${cdn.replace(RE_TRAILING_SLASH, '')}/${collection}.json`
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
				if (!unit)
					return
				if (!props.width)
					props.width = `${scale}${unit}`
				if (!props.height)
					props.height = `${scale}${unit}`
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
			iconsConfig = config.icons ?? {}
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
			const autocompletePatterns = createAutocompletePatterns(prefixes)

			engine.appendAutocomplete({
				patterns: {
					shortcuts: autocompletePatterns,
				},
			})

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
