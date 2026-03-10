// pika.config.ts
import { icons } from '@pikacss/plugin-icons'
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	plugins: [icons()],
	icons: {
		// Icon 縮放倍率（預設為 1）
		scale: 1.2,
		// 渲染模式：'auto' | 'mask' | 'bg'（預設為 'auto'）
		mode: 'mask',
		// Shortcut 前綴（預設為 'i-'）
		prefix: 'i-',
		// 從 workspace root 解析本機的 Iconify JSON packages
		cwd: process.cwd(),
		// 視需要自動安裝 icon packages
		autoInstall: true,
		// 套用到每個 icon 的額外 CSS properties
		extraProperties: {
			'display': 'inline-block',
			'vertical-align': 'middle',
		},
		// 寬高使用的 CSS 單位（例如 'em'、'rem'）
		unit: 'em',
		// 找不到 collection 時可使用的 CDN fallback（可選）
		// cdn: 'https://cdn.example.com/icons/{collection}.json',
	},
})
