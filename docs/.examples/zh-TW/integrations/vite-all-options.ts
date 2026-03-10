// vite.config.ts：列出所有可用的 plugin options 與預設值
import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		PikaCSS({
			// 如果找不到 pika.config.{js,ts}，就自動建立一份。
			// 設成 false 可停用自動建立。
			autoCreateConfig: true, // [!code highlight]

			// 在原始碼中用來定義樣式的函式名稱。
			// PikaCSS 會掃描對這個函式的呼叫。
			fnName: 'pika', // [!code highlight]

			// 轉換後的輸出格式：
			//   'string' — 回傳 "pk-a pk-b pk-c"（空白分隔字串）
			//   'array'  — 回傳 ['pk-a', 'pk-b', 'pk-c']
			transformedFormat: 'string', // [!code highlight]

			// TypeScript codegen 檔案路徑。
			//   true   — 產生 'pika.gen.ts'（預設）
			//   false  — 停用 TS codegen
			//   string — 自訂檔案路徑
			tsCodegen: true, // [!code highlight]

			// CSS codegen 檔案路徑。
			//   true   — 產生 'pika.gen.css'（預設）
			//   string — 自訂檔案路徑
			cssCodegen: true, // [!code highlight]

			// 檔案掃描 patterns（glob 格式）。
			scan: {
				include: ['**/*.{js,ts,jsx,tsx,vue}'], // [!code highlight]
				exclude: ['node_modules/**', 'dist/**'], // [!code highlight]
			},

			// Engine 設定：可用 inline object 或 config file 路徑。
			// config: { /* EngineConfig */ },
			// config: './pika.config.ts',
		}),
	],
})
