import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'
import {
	proseBaseStyle,
	proseCodeStyle,
	proseEmphasisStyle,
	proseHeadingsStyle,
	proseHrStyle,
	proseKbdStyle,
	proseLinksStyle,
	proseListsStyle,
	proseMediaStyle,
	proseParagraphsStyle,
	proseQuotesStyle,
	proseTablesStyle,
	typographyVariables,
} from './styles'

export interface TypographyPluginOptions {
	/**
	 * Custom variables to override the default typography variables.
	 */
	variables?: Partial<typeof typographyVariables>
}

const proseShortcutModules = [
	['prose-paragraphs', proseParagraphsStyle],
	['prose-links', proseLinksStyle],
	['prose-emphasis', proseEmphasisStyle],
	['prose-kbd', proseKbdStyle],
	['prose-lists', proseListsStyle],
	['prose-hr', proseHrStyle],
	['prose-headings', proseHeadingsStyle],
	['prose-quotes', proseQuotesStyle],
	['prose-media', proseMediaStyle],
	['prose-code', proseCodeStyle],
	['prose-tables', proseTablesStyle],
] as const

const proseSizeVariants = {
	'sm': { fontSize: '0.875rem', lineHeight: '1.71' },
	'lg': { fontSize: '1.125rem', lineHeight: '1.77' },
	'xl': { fontSize: '1.25rem', lineHeight: '1.8' },
	'2xl': { fontSize: '1.5rem', lineHeight: '1.66' },
} as const

function registerTypographyShortcuts(engine: Parameters<NonNullable<EnginePlugin['configureEngine']>>[0]) {
	engine.shortcuts.add(['prose-base', proseBaseStyle])

	proseShortcutModules.forEach(([name, style]) => {
		engine.shortcuts.add([name, ['prose-base', style]])
	})

	engine.shortcuts.add([
		'prose',
		proseShortcutModules.map(([name]) => name),
	])

	Object.entries(proseSizeVariants)
		.forEach(([size, overrides]) => {
			engine.shortcuts.add([
				`prose-${size}`,
				['prose', overrides],
			])
		})
}

declare module '@pikacss/core' {
	interface EngineConfig {
		typography?: TypographyPluginOptions
	}
}

export function typography(): EnginePlugin {
	let typographyConfig: TypographyPluginOptions = {}
	return defineEnginePlugin({
		name: 'typography',
		configureRawConfig: (config) => {
			if (config.typography)
				typographyConfig = config.typography
		},
		configureEngine: async (engine) => {
			// Add variables
			engine.variables.add({
				...typographyVariables,
				...typographyConfig.variables,
			})

			registerTypographyShortcuts(engine)
		},
	})
}
