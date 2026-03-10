// vite.config.ts — inline engine 設定（不需要另外拆出 config file）
import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		PikaCSS({
			// 直接傳入 engine config；使用 inline config 時會忽略 autoCreateConfig
			config: {
				prefix: 'pk-',
				shortcuts: {
					btn: { padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
				},
			},
			autoCreateConfig: false,
		}),
	],
})
