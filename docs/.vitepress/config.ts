import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { groupIconMdPlugin as MarkdownItGroupIcon } from 'vitepress-plugin-group-icons'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid({
	base: '/pikacss/',

	title: 'PikaCSS',
	description: 'PikaCSS Documents',
	head: [
		['link', { rel: 'icon', href: '/pikacss/favicon.svg' }],
	],
	themeConfig: {
		logo: {
			light: '/logo-black.svg',
			dark: '/logo-white.svg',
		},

		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Guide', link: '/getting-started/what-is-pikacss' },
			{ text: 'Advanced', link: '/advanced/architecture' },
			{ text: 'Integrations', link: '/integrations/vite' },
		],

		sidebar: {
			'/': [
				{
					text: 'Getting Started',
					items: [
						{ text: 'What is PikaCSS?', link: '/getting-started/what-is-pikacss' },
						{ text: 'Installation', link: '/getting-started/installation' },
					],
				},
				{
					text: 'Guide',
					items: [
						{ text: 'Basics', link: '/guide/basics' },
						{ text: 'Configuration', link: '/guide/configuration' },
						{ text: 'Preflights', link: '/guide/preflights' },
						{ text: 'Variables', link: '/guide/variables' },
						{ text: 'Keyframes', link: '/guide/keyframes' },
						{ text: 'Selectors', link: '/guide/selectors' },
						{ text: 'Shortcuts', link: '/guide/shortcuts' },
						{ text: 'Important', link: '/guide/important' },
						{ text: 'Plugin System', link: '/guide/plugin-system' },
					],
				},
				{
					text: 'Plugins',
					items: [
						{ text: 'Icons', link: '/plugins/icons' },
						{ text: 'Reset', link: '/plugins/reset' },
						{ text: 'Typography', link: '/plugins/typography' },
					],
				},
			],
			'/advanced/': [
				{
					text: 'Advanced',
					items: [
						{ text: 'Architecture', link: '/advanced/architecture' },
						{ text: 'Plugin Development', link: '/advanced/plugin-development' },
						{ text: 'Plugin Hooks', link: '/advanced/plugin-hooks' },
						{ text: 'Module Augmentation', link: '/advanced/module-augmentation' },
						{ text: 'API Reference', link: '/advanced/api-reference' },
						{ text: 'Troubleshooting', link: '/advanced/troubleshooting' },
					],
				},
			],
			'/integrations/': [
				{
					text: 'Integrations',
					items: [
						{ text: 'Vite', link: '/integrations/vite' },
						{ text: 'Nuxt', link: '/integrations/nuxt' },
						{ text: 'Webpack', link: '/integrations/webpack' },
						{ text: 'Rspack', link: '/integrations/rspack' },
						{ text: 'Esbuild', link: '/integrations/esbuild' },
						{ text: 'Farm', link: '/integrations/farm' },
					],
				},
			],
			'/llm/': [
				{
					text: 'LLM Knowledge Base',
					items: [
						{ text: 'Overview', link: '/llm/' },
						{ text: 'Architecture', link: '/llm/architecture' },
						{ text: 'Basics', link: '/llm/basics' },
						{ text: 'Configuration', link: '/llm/configuration' },
						{ text: 'Installation', link: '/llm/installation' },
						{ text: 'Integrations', link: '/llm/integrations' },
						{ text: 'Selectors', link: '/llm/selectors' },
						{ text: 'Plugins', link: '/llm/plugins' },
						{ text: 'Icons Plugin', link: '/llm/icons-plugin' },
						{ text: 'API Reference', link: '/llm/api-reference' },
						{ text: 'Troubleshooting', link: '/llm/troubleshooting' },
					],
				},
			],
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/pikacss/pikacss' },
		],
	},

	markdown: {
		config: (md) => {
			md.use(MarkdownItGroupIcon)
		},
		codeTransformers: [
			transformerTwoslash({
				// twoslashOptions: {
				// 	extraFiles: {
				// 		'pika.d.ts': '/// <reference types="./.vitepress/pika.d.ts" />\n',
				// 	},
				// },
			}),
		],
		languages: ['js', 'jsx', 'ts', 'tsx'],
	},
})
