// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: [
		'@pikacss/nuxt-pikacss',
	],

	app: {
		head: {
			title: 'PikaCSS Example - Nuxt',
			link: [
				{ rel: 'icon', type: 'image/svg+xml', href: '/logo-black.svg' },
			],
		},
	},
})
