export default defineNuxtConfig({
	modules: ['@pikacss/nuxt-pikacss'],
	pikacss: {
		scan: {
			include: ['**/*.{js,ts,jsx,tsx,vue}'],
		},
	},
})