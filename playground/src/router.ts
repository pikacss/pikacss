import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/:template?',
			component: App,
		},
	],
})
