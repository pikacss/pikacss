import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { groupIconMdPlugin as MarkdownItGroupIcon } from 'vitepress-plugin-group-icons'
import { withMermaid } from 'vitepress-plugin-mermaid'

const englishNav = [
	{ text: 'Start Here', link: '/getting-started/what-is-pikacss' },
	{ text: 'Patterns', link: '/patterns/component-styling' },
	{ text: 'Reference', link: '/guide/configuration' },
	{ text: 'Advanced', link: '/plugin-system/overview' },
	{ text: 'FAQ', link: '/community/faq' },
]

const englishSidebar = [
	{
		text: 'Start Here',
		items: [
			{ text: 'What Is PikaCSS?', link: '/getting-started/what-is-pikacss' },
			{ text: 'Installation', link: '/getting-started/installation' },
			{ text: 'First Pika', link: '/getting-started/first-pika' },
			{ text: 'Static Arguments', link: '/getting-started/static-arguments' },
			{ text: 'Zero Config', link: '/getting-started/zero-config' },
		],
	},
	{
		text: 'Core Concepts',
		items: [
			{ text: 'How PikaCSS Works', link: '/concepts/how-pikacss-works' },
			{ text: 'Atomic Order And Cascade', link: '/concepts/atomic-order-and-cascade' },
			{ text: 'Build-time Engine', link: '/concepts/build-time-engine' },
		],
	},
	{
		text: 'Patterns',
		items: [
			{ text: 'Component Styling', link: '/patterns/component-styling' },
			{ text: 'Responsive And Selectors', link: '/patterns/responsive-and-selectors' },
			{ text: 'Dynamic Values With CSS Variables', link: '/patterns/dynamic-values-with-css-variables' },
			{ text: 'Theming And Variables', link: '/patterns/theming-and-variables' },
		],
	},
	{
		text: 'Reference',
		items: [
			{ text: 'Configuration', link: '/guide/configuration' },
			{ text: 'Built-in Plugins', link: '/guide/built-in-plugins' },
			{ text: 'Generated Files', link: '/guide/generated-files' },
		],
	},
	{
		text: 'Integrations',
		items: [
			{ text: 'Overview', link: '/integrations/overview' },
			{ text: 'Vite', link: '/integrations/vite' },
			{ text: 'Nuxt', link: '/integrations/nuxt' },
			{ text: 'ESLint', link: '/integrations/eslint' },
		],
	},
	{
		text: 'Troubleshooting',
		items: [
			{ text: 'Common Problems', link: '/troubleshooting/common-problems' },
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
		text: 'Extend PikaCSS',
		items: [
			{ text: 'Plugin System Overview', link: '/plugin-system/overview' },
			{ text: 'Create A Plugin', link: '/plugin-system/create-plugin' },
			{ text: 'Hook Execution', link: '/plugin-system/hook-execution' },
		],
	},
	{
		text: 'Community',
		items: [
			{ text: 'FAQ', link: '/community/faq' },
		],
	},
]

const zhTwNav = [
	{ text: '從這裡開始', link: '/zh-TW/getting-started/what-is-pikacss' },
	{ text: '實作模式', link: '/zh-TW/patterns/component-styling' },
	{ text: '參考', link: '/zh-TW/guide/configuration' },
	{ text: '進階', link: '/zh-TW/plugin-system/overview' },
	{ text: 'FAQ', link: '/zh-TW/community/faq' },
]

const zhTwSidebar = [
	{
		text: '從這裡開始',
		items: [
			{ text: '什麼是 PikaCSS？', link: '/zh-TW/getting-started/what-is-pikacss' },
			{ text: '安裝', link: '/zh-TW/getting-started/installation' },
			{ text: '第一個 Pika', link: '/zh-TW/getting-started/first-pika' },
			{ text: '靜態參數', link: '/zh-TW/getting-started/static-arguments' },
			{ text: '零設定', link: '/zh-TW/getting-started/zero-config' },
		],
	},
	{
		text: '核心概念',
		items: [
			{ text: 'PikaCSS 如何運作', link: '/zh-TW/concepts/how-pikacss-works' },
			{ text: 'Atomic 順序與 Cascade', link: '/zh-TW/concepts/atomic-order-and-cascade' },
			{ text: 'Build-time Engine', link: '/zh-TW/concepts/build-time-engine' },
		],
	},
	{
		text: '實作模式',
		items: [
			{ text: '元件樣式設計', link: '/zh-TW/patterns/component-styling' },
			{ text: 'Responsive 與 Selectors', link: '/zh-TW/patterns/responsive-and-selectors' },
			{ text: 'Dynamic Values 與 CSS Variables', link: '/zh-TW/patterns/dynamic-values-with-css-variables' },
			{ text: '主題化與 Variables', link: '/zh-TW/patterns/theming-and-variables' },
		],
	},
	{
		text: '參考',
		items: [
			{ text: '設定方式', link: '/zh-TW/guide/configuration' },
			{ text: '內建 Plugins', link: '/zh-TW/guide/built-in-plugins' },
			{ text: '產生檔案', link: '/zh-TW/guide/generated-files' },
		],
	},
	{
		text: '整合',
		items: [
			{ text: '總覽', link: '/zh-TW/integrations/overview' },
			{ text: 'Vite', link: '/zh-TW/integrations/vite' },
			{ text: 'Nuxt', link: '/zh-TW/integrations/nuxt' },
			{ text: 'ESLint', link: '/zh-TW/integrations/eslint' },
		],
	},
	{
		text: '疑難排解',
		items: [
			{ text: '常見問題', link: '/zh-TW/troubleshooting/common-problems' },
		],
	},
	{
		text: '官方 Plugins',
		items: [
			{ text: 'Icons', link: '/zh-TW/plugins/icons' },
			{ text: 'Reset', link: '/zh-TW/plugins/reset' },
			{ text: 'Typography', link: '/zh-TW/plugins/typography' },
		],
	},
	{
		text: '擴充 PikaCSS',
		items: [
			{ text: 'Plugin 系統總覽', link: '/zh-TW/plugin-system/overview' },
			{ text: '建立 Plugin', link: '/zh-TW/plugin-system/create-plugin' },
			{ text: 'Hook 執行順序', link: '/zh-TW/plugin-system/hook-execution' },
		],
	},
	{
		text: '社群',
		items: [
			{ text: 'FAQ', link: '/zh-TW/community/faq' },
		],
	},
]

export default withMermaid({
	base: '/',
	title: 'PikaCSS',
	description: 'Build-time atomic CSS-in-JS for teams that want real CSS ergonomics and zero runtime cost.',
	locales: {
		'root': {
			label: 'English',
			lang: 'en',
		},
		'zh-TW': {
			label: '繁體中文',
			lang: 'zh-TW',
			link: '/zh-TW/',
			title: 'PikaCSS',
			description: '為重視真實 CSS 體驗與零 runtime 成本的團隊而生的 build-time atomic CSS-in-JS。',
			themeConfig: {
				nav: zhTwNav,
				sidebar: {
					'/zh-TW/': zhTwSidebar,
				},
			},
		},
	},
	head: [
		['link', { rel: 'icon', href: '/favicon.svg' }],
	],
	themeConfig: {
		logo: {
			light: '/logo-black.svg',
			dark: '/logo-white.svg',
		},
		nav: englishNav,
		sidebar: {
			'/': englishSidebar,
			'/zh-TW/': zhTwSidebar,
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
			transformerTwoslash(),
		],
		languages: ['js', 'jsx', 'ts', 'tsx'],
	},
})
