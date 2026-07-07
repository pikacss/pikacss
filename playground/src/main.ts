import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import 'pika.css'

import './style.css'

createApp(App)
	.use(router)
	.mount('#app')
