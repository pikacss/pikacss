import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { groupIconMdPlugin as MarkdownItGroupIcon } from 'vitepress-plugin-group-icons'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { nav, sidebar } from './sidebarAndNav'

export default withMermaid({
	base: '/',
	title: 'PikaCSS',
	description: '',
	head: [
		['link', { rel: 'icon', href: '/favicon.svg' }],
	],
	themeConfig: {
		logo: {
			light: '/logo-black.svg',
			dark: '/logo-white.svg',
		},
		nav,
		sidebar: {
			'/': sidebar,
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
