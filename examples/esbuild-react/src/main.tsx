import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'modern-normalize/modern-normalize.css'
import 'pika.css'

createRoot(document.getElementById('root')!)
	.render(
		<StrictMode>
			<App />
		</StrictMode>,
	)
