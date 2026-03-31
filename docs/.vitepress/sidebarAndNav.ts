import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.NavItem[] = [
	{
		text: 'Guide',
		items: [
			{ text: 'Getting Started', link: '/getting-started/what-is-pikacss' },
			{ text: 'Integrations', link: '/integrations/unplugin' },
			{ text: 'Customizations', link: '/customizations/layers' },
		],
	},
	{
		text: 'Plugins',
		items: [
			{ text: 'Official Plugins', link: '/official-plugins/reset' },
			{ text: 'Plugin Development', link: '/plugin-development/create-a-plugin' },
		],
	},
	{ text: 'API Reference', link: '/api/' },
]

export const sidebar: DefaultTheme.SidebarItem[] = [
	{
		text: 'Getting Started',
		items: [
			{ text: 'What is PikaCSS', link: '/getting-started/what-is-pikacss' },
			{ text: 'Setup', link: '/getting-started/setup' },
			{ text: 'Usage', link: '/getting-started/usage' },
			{ text: 'Engine Config', link: '/getting-started/engine-config' },
			{ text: 'ESLint Config', link: '/getting-started/eslint-config' },
		],
	},
	{
		text: 'Integrations',
		collapsed: true,
		items: [
			{ text: 'Unplugin', link: '/integrations/unplugin' },
			{ text: 'Nuxt', link: '/integrations/nuxt' },
			{ text: 'Agent Skills', link: '/integrations/agent-skills' },
		],
	},
	{
		text: 'Customizations',
		collapsed: true,
		items: [
			{ text: 'Layers', link: '/customizations/layers' },
			{ text: 'Important', link: '/customizations/important' },
			{ text: 'Preflights', link: '/customizations/preflights' },
			{ text: 'Variables', link: '/customizations/variables' },
			{ text: 'Keyframes', link: '/customizations/keyframes' },
			{ text: 'Selectors', link: '/customizations/selectors' },
			{ text: 'Shortcuts', link: '/customizations/shortcuts' },
			{ text: 'Autocomplete', link: '/customizations/autocomplete' },
		],
	},
	{
		text: 'Official Plugins',
		collapsed: true,
		items: [
			{ text: 'Reset', link: '/official-plugins/reset' },
			{ text: 'Typography', link: '/official-plugins/typography' },
			{ text: 'Icons', link: '/official-plugins/icons' },
			{ text: 'Fonts', link: '/official-plugins/fonts' },
		],
	},
	{
		text: 'Plugin Development',
		collapsed: true,
		items: [
			{ text: 'Create a Plugin', link: '/plugin-development/create-a-plugin' },
			{ text: 'Available Hooks', link: '/plugin-development/available-hooks' },
			{ text: 'Type Augmentation', link: '/plugin-development/type-augmentation' },
			{ text: 'Define Helpers', link: '/plugin-development/define-helpers' },
		],
	},
	{
		text: 'API Reference',
		collapsed: true,
		items: [
			{ text: 'Overview', link: '/api/' },
			{ text: 'Core', link: '/api/core' },
			{ text: 'Integration', link: '/api/integration' },
			{ text: 'Unplugin', link: '/api/unplugin' },
			{ text: 'Nuxt', link: '/api/nuxt' },
			{ text: 'Plugin Reset', link: '/api/plugin-reset' },
			{ text: 'Plugin Icons', link: '/api/plugin-icons' },
			{ text: 'Plugin Fonts', link: '/api/plugin-fonts' },
			{ text: 'Plugin Typography', link: '/api/plugin-typography' },
			{ text: 'ESLint Config', link: '/api/eslint-config' },
		],
	},
	{
		text: 'Troubleshooting',
		collapsed: true,
		items: [
			{ text: 'FAQ', link: '/troubleshooting/faq' },
		],
	},
]
