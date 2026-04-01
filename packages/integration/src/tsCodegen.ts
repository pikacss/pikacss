import type { IntegrationContext } from './types'
import { log, sortLayerNames } from '@pikacss/core'

const RE_LEADING_INDENT = /^(\s*)/

function formatUnionType(parts: string[]) {
	return parts.length > 0
		? parts.join(' | ')
		: 'never'
}

function formatUnionStringType(list: string[]) {
	return formatUnionType(list.map(i => JSON.stringify(i)))
}

function formatAutocompleteUnion(literals: Iterable<string>, patterns: Iterable<string>) {
	return formatUnionType([
		...Array.from(literals, value => JSON.stringify(value)),
		...patterns,
	])
}

function formatAutocompleteValueMap(
	keys: Iterable<string>,
	entries: Map<string, string[]>,
	patternEntries: Map<string, string[]>,
	formatValue: (values: string[], patterns: string[]) => string,
) {
	const mergedKeys = new Set<string>(keys)
	for (const key of entries.keys()) {
		mergedKeys.add(key)
	}
	for (const key of patternEntries.keys()) {
		mergedKeys.add(key)
	}

	return mergedKeys.size > 0
		? `{ ${Array.from(mergedKeys, key => `${JSON.stringify(key)}: ${formatValue(entries.get(key) || [], patternEntries.get(key) || [])}`)
			.join(', ')} }`
		: 'never'
}

function generateAutocomplete(ctx: IntegrationContext) {
	const autocomplete = ctx.engine.config.autocomplete
	const patterns = autocomplete.patterns ?? {
		selectors: new Set<string>(),
		shortcuts: new Set<string>(),
		properties: new Map<string, string[]>(),
		cssProperties: new Map<string, string[]>(),
	}
	const { layers } = ctx.engine.config
	const layerNames = sortLayerNames(layers)
	return [
		'export type Autocomplete = DefineAutocomplete<{',
		`  Selector: ${formatAutocompleteUnion(autocomplete.selectors, patterns.selectors)}`,
		`  Shortcut: ${formatAutocompleteUnion(autocomplete.shortcuts, patterns.shortcuts)}`,
		`  PropertyValue: ${formatAutocompleteValueMap(autocomplete.extraProperties, autocomplete.properties, patterns.properties, (values, patterns) => formatUnionType([...values, ...patterns]))}`,
		`  CSSPropertyValue: ${formatAutocompleteValueMap(autocomplete.extraCssProperties, autocomplete.cssProperties, patterns.cssProperties, (values, patterns) => formatAutocompleteUnion(values, patterns))}`,
		`  Layer: ${formatUnionStringType(layerNames)}`,
		'}>',
		'',
	]
}

function generateStyleFn(ctx: IntegrationContext) {
	const { transformedFormat } = ctx
	const lines: string[] = [
		'type StyleFn_Array = (...params: StyleItem[]) => string[]',
		'type StyleFn_String = (...params: StyleItem[]) => string',
	]

	if (transformedFormat === 'array')
		lines.push('type StyleFn_Normal = StyleFn_Array')
	else if (transformedFormat === 'string')
		lines.push('type StyleFn_Normal = StyleFn_String')

	lines.push(
		'type StyleFn = StyleFn_Normal & {',
		'  str: StyleFn_String',
		'  arr: StyleFn_Array',
		'}',
		`type StyleFnWithPreview = PreviewOverloads<StyleFn_Normal>[\'fn\'] & {`,
		`  str: PreviewOverloads<StyleFn_String>[\'fn\']`,
		`  arr: PreviewOverloads<StyleFn_Array>[\'fn\']`,
		'}',
		'',
	)

	return lines
}

function generateGlobalDeclaration(ctx: IntegrationContext) {
	const { fnName } = ctx
	return [
		'declare global {',
		'  /**',
		'   * PikaCSS',
		'   */',
		`  const ${fnName}: StyleFn`,
		'',
		'  /**',
		'   * PikaCSS Preview',
		'   */',
		`  const ${fnName}p: StyleFnWithPreview`,
		'}',
		'',
	]
}

function generateVueDeclaration(ctx: IntegrationContext) {
	const { hasVue, fnName } = ctx

	if (!hasVue)
		return []

	return [
		'declare module \'vue\' {',
		'  interface ComponentCustomProperties {',
		'    /**',
		'     * PikaCSS',
		'     */',
		`    ${fnName}: StyleFn`,
		'',
		'    /**',
		'     * PikaCSS Preview',
		'     */',
		`    ${fnName}p: StyleFnWithPreview`,
		'  }',
		'}',
		'',
	]
}

async function generateOverloadContent(ctx: IntegrationContext) {
	log.debug('Generating TypeScript overload content')
	const paramsLines: string[] = []
	const fnsLines: string[] = []
	const usages = [...ctx.previewUsages.values()].flat()
	log.debug(`Processing ${usages.length} preview usages for overload generation`)

	for (let i = 0; i < usages.length; i++) {
		const usage = usages[i]!
		try {
			const addedParamsLines = usage.params.map((param, index) => `type P${i}_${index} = ${JSON.stringify(param)}`)
			const addedFnLines = [
				'  /**',
				'   * ### PikaCSS Preview',
				'   * ```css',
				// CSS Lines
				...(await ctx.engine.renderAtomicStyles(true, { atomicStyleIds: usage.atomicStyleIds, isPreview: true }))
					.trim()
					.split('\n')
					.map(line => `   * ‎${line.replace(RE_LEADING_INDENT, '$1‎')}`),
				'   * ```',
				'   */',
				`  fn(...params: [${usage.params.map((_, index) => `p${index}: P${i}_${index}`)
					.join(', ')}]): ReturnType<StyleFn>`,
			]

			paramsLines.push(...addedParamsLines)
			fnsLines.push(...addedFnLines)
		}
		catch {}
	}

	return [
		'interface PreviewOverloads<StyleFn extends (StyleFn_Array | StyleFn_String)> {',
		...fnsLines,
		'  /**',
		'   * PikaCSS Preview',
		'   * Save the current file to see the preview.',
		'   */',
		`  fn(...params: Parameters<StyleFn>): ReturnType<StyleFn>`,
		'}',
		...paramsLines,
	]
}

/**
 * Generates the full content of the `pika.gen.ts` TypeScript declaration file from the current engine and usage state.
 * @internal
 *
 * @param ctx - The integration context providing engine config, usage records, and codegen settings.
 * @returns The complete TypeScript source string for the generated declaration file.
 *
 * @remarks
 * The output includes module augmentation for `PikaAugment`, autocomplete type literals
 * derived from selectors/shortcuts/properties, style function type overloads (respecting
 * `transformedFormat`), global declarations, optional Vue component property declarations,
 * and per-usage preview overloads with inline CSS previews.
 */
export async function generateTsCodegenContent(ctx: IntegrationContext) {
	log.debug('Generating TypeScript code generation content')

	const lines = [
		`// Auto-generated by ${ctx.currentPackageName}`,
		`import type { CSSProperty, CSSSelector, DefineAutocomplete, Properties, StyleDefinition, StyleItem } from \'${ctx.currentPackageName}\'`,
		'',
		`declare module \'${ctx.currentPackageName}\' {`,
		'  interface PikaAugment {',
		'    Autocomplete: Autocomplete',
		'    Selector: Autocomplete[\'Selector\'] | CSSSelector',
		'    CSSProperty: ([Autocomplete[\'CSSPropertyValue\']] extends [never] ? never : Extract<keyof Autocomplete[\'CSSPropertyValue\'], string>) | CSSProperty',
		'    Properties: Properties',
		'    StyleDefinition: StyleDefinition',
		'    StyleItem: StyleItem',
		'  }',
		'}',
		'',
	]

	lines.push(...generateAutocomplete(ctx))
	lines.push(...generateStyleFn(ctx))
	lines.push(...generateGlobalDeclaration(ctx))
	lines.push(...generateVueDeclaration(ctx))
	lines.push(...await generateOverloadContent(ctx))
	log.debug('TypeScript code generation content completed')

	return lines.join('\n')
}
