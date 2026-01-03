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

	/**
	 *
	 */
}

declare module '@pikacss/core' {
	interface EngineConfig {
		typography?: TypographyPluginOptions
	}
}

export function typography(options: TypographyPluginOptions = {}): EnginePlugin {
	return defineEnginePlugin({
		name: 'typography',
		configureEngine: async (engine) => {
			// Add variables
			engine.variables.add({
				...typographyVariables,
				...options.variables,
			})

			// Add modular shortcuts
			engine.shortcuts.add(['prose-base', proseBaseStyle])
			engine.shortcuts.add(['prose-paragraphs', ['prose-base', proseParagraphsStyle]])
			engine.shortcuts.add(['prose-links', ['prose-base', proseLinksStyle]])
			engine.shortcuts.add(['prose-emphasis', ['prose-base', proseEmphasisStyle]])
			engine.shortcuts.add(['prose-kbd', ['prose-base', proseKbdStyle]])
			engine.shortcuts.add(['prose-lists', ['prose-base', proseListsStyle]])
			engine.shortcuts.add(['prose-hr', ['prose-base', proseHrStyle]])
			engine.shortcuts.add(['prose-headings', ['prose-base', proseHeadingsStyle]])
			engine.shortcuts.add(['prose-quotes', ['prose-base', proseQuotesStyle]])
			engine.shortcuts.add(['prose-media', ['prose-base', proseMediaStyle]])
			engine.shortcuts.add(['prose-code', ['prose-base', proseCodeStyle]])
			engine.shortcuts.add(['prose-tables', ['prose-base', proseTablesStyle]])
			engine.shortcuts.add([
				'prose',
				[
					'prose-paragraphs',
					'prose-links',
					'prose-emphasis',
					'prose-kbd',
					'prose-lists',
					'prose-hr',
					'prose-headings',
					'prose-quotes',
					'prose-media',
					'prose-code',
					'prose-tables',
				],
			])
			const sizes = {
				'sm': { fontSize: '0.875rem', lineHeight: '1.71' },
				'lg': { fontSize: '1.125rem', lineHeight: '1.77' },
				'xl': { fontSize: '1.25rem', lineHeight: '1.8' },
				'2xl': { fontSize: '1.5rem', lineHeight: '1.66' },
			}

			Object.entries(sizes)
				.forEach(([size, overrides]) => {
					engine.shortcuts.add([
						`prose-${size}`,
						[
							'prose',
							overrides,
						],
					])
				})
		},
	})
}
