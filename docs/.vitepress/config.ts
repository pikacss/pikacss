import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { groupIconMdPlugin as MarkdownItGroupIcon } from 'vitepress-plugin-group-icons'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid({
	base: '/',

	title: 'PikaCSS',
	description: 'PikaCSS Documents',
	head: [
		['link', { rel: 'icon', href: '/favicon.svg' }],
	],

	locales: {
		'root': {
			label: 'English',
			lang: 'en-US',
		},
		'zh-TW': {
			label: '繁體中文',
			lang: 'zh-TW',
			link: '/zh-TW/',
			title: 'PikaCSS',
			description: 'PikaCSS — 即時原子化 CSS-in-JS 引擎',
			themeConfig: {
				outlineTitle: '本頁目錄',
				darkModeSwitchLabel: '外觀',
				sidebarMenuLabel: '選單',
				returnToTopLabel: '回到頂部',
				langMenuLabel: '更改語言',
				docFooter: { prev: '上一頁', next: '下一頁' },
				lastUpdatedText: '最後更新於',
				nav: [
					{ text: '快速上手', link: '/zh-TW/getting-started/what-is-pikacss' },
					{ text: 'FAQ', link: '/zh-TW/community/faq' },
				],
				sidebar: {
					'/zh-TW/': [
						{
							text: '快速上手',
							items: [
								{ text: '什麼是 PikaCSS？', link: '/zh-TW/getting-started/what-is-pikacss' },
								{ text: '安裝', link: '/zh-TW/getting-started/installation' },
								{ text: '零設定', link: '/zh-TW/getting-started/zero-config' },
								{ text: '第一個 Pika', link: '/zh-TW/getting-started/first-pika' },
							],
						},
						{
							text: '核心原則',
							items: [
								{ text: '建置時期編譯', link: '/zh-TW/principles/build-time-compile' },
								{ text: '零副作用', link: '/zh-TW/principles/zero-sideeffect' },
							],
						},
						{
							text: '整合',
							items: [
								{ text: '概覽', link: '/zh-TW/integrations/overview' },
								{ text: 'Vite', link: '/zh-TW/integrations/vite' },
								{ text: 'Rollup', link: '/zh-TW/integrations/rollup' },
								{ text: 'Nuxt', link: '/zh-TW/integrations/nuxt' },
								{ text: 'Webpack', link: '/zh-TW/integrations/webpack' },
								{ text: 'Rspack', link: '/zh-TW/integrations/rspack' },
								{ text: 'Esbuild', link: '/zh-TW/integrations/esbuild' },
								{ text: 'Rolldown', link: '/zh-TW/integrations/rolldown' },
								{ text: 'ESLint', link: '/zh-TW/integrations/eslint' },
							],
						},
						{
							text: '設定與內建功能',
							items: [
								{ text: '設定', link: '/zh-TW/guide/configuration' },
								{ text: '內建插件', link: '/zh-TW/guide/built-in-plugins' },
								{ text: 'Important', link: '/zh-TW/guide/built-ins/important' },
								{ text: 'Variables', link: '/zh-TW/guide/built-ins/variables' },
								{ text: 'Keyframes', link: '/zh-TW/guide/built-ins/keyframes' },
								{ text: 'Selectors', link: '/zh-TW/guide/built-ins/selectors' },
								{ text: 'Shortcuts', link: '/zh-TW/guide/built-ins/shortcuts' },
							],
						},
						{
							text: '插件系統',
							items: [
								{ text: '概覽', link: '/zh-TW/plugin-system/overview' },
								{ text: '建立插件', link: '/zh-TW/plugin-system/create-plugin' },
							],
						},
						{
							text: '官方插件',
							items: [
								{ text: 'Icons', link: '/zh-TW/plugins/icons' },
								{ text: 'Reset', link: '/zh-TW/plugins/reset' },
								{ text: 'Typography', link: '/zh-TW/plugins/typography' },
							],
						},
						{
							text: 'FAQ',
							items: [{ text: 'FAQ', link: '/zh-TW/community/faq' }],
						},
					],
				},
			},
		},
	},

	themeConfig: {
		logo: {
			light: '/logo-black.svg',
			dark: '/logo-white.svg',
		},

		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Getting Started', link: '/getting-started/what-is-pikacss' },
			{ text: 'FAQ', link: '/community/faq' },
		],

		sidebar: {
			'/': [
				{
					text: 'Getting Started',
					items: [
						{ text: 'What is PikaCSS?', link: '/getting-started/what-is-pikacss' },
						{ text: 'Installation', link: '/getting-started/installation' },
						{ text: 'Zero Config', link: '/getting-started/zero-config' },
						{ text: 'First Pika', link: '/getting-started/first-pika' },
					],
				},
				{
					text: 'Core Principles',
					items: [
						{ text: 'Build-time Compile', link: '/principles/build-time-compile' },
						{ text: 'Zero Sideeffect', link: '/principles/zero-sideeffect' },
					],
				},
				{
					text: 'Integrations',
					items: [
						{ text: 'Overview', link: '/integrations/overview' },
						{ text: 'Vite', link: '/integrations/vite' },
						{ text: 'Rollup', link: '/integrations/rollup' },
						{ text: 'Nuxt', link: '/integrations/nuxt' },
						{ text: 'Webpack', link: '/integrations/webpack' },
						{ text: 'Rspack', link: '/integrations/rspack' },
						{ text: 'Esbuild', link: '/integrations/esbuild' },
						{ text: 'Rolldown', link: '/integrations/rolldown' },
						{ text: 'ESLint', link: '/integrations/eslint' },
					],
				},
				{
					text: 'Config & Built-ins',
					items: [
						{ text: 'Configuration', link: '/guide/configuration' },
						{ text: 'Built-in Plugins', link: '/guide/built-in-plugins' },
						{ text: 'Important', link: '/guide/built-ins/important' },
						{ text: 'Variables', link: '/guide/built-ins/variables' },
						{ text: 'Keyframes', link: '/guide/built-ins/keyframes' },
						{ text: 'Selectors', link: '/guide/built-ins/selectors' },
						{ text: 'Shortcuts', link: '/guide/built-ins/shortcuts' },
					],
				},
				{
					text: 'Plugin System',
					items: [
						{ text: 'Overview', link: '/plugin-system/overview' },
						{ text: 'Create Plugin', link: '/plugin-system/create-plugin' },
					],
				},
				{
					text: 'Official Plugins',
					items: [
						{ text: 'Icons', link: '/plugins/icons' },
						{ text: 'Reset', link: '/plugins/reset' },
						{ text: 'Typography', link: '/plugins/typography' },
					],
				},
				{
					text: 'FAQ',
					items: [{ text: 'FAQ', link: '/community/faq' }],
				},
			],
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/pikacss/pikacss' },
		],

		search: {
			provider: 'local',
		},
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
