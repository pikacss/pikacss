import type { PluginOptions } from '@pikacss/unplugin-pikacss'

// 所有 options 都是選填，系統會提供合理的預設值
const options: PluginOptions = {
	// 用來掃描 pika() 呼叫的檔案規則
	scan: {
		include: ['**/*.{js,ts,jsx,tsx,vue}'], // 預設值
		exclude: ['node_modules/**', 'dist/**'], // 預設值
	},

	// engine 設定：可以直接傳入物件，也可以指定 config file 路徑
	config: './pika.config.ts',

	// 如果找不到 config file，就自動建立一份
	autoCreateConfig: true, // 預設值

	// 在原始碼裡要偵測的函式名稱
	fnName: 'pika', // 預設值

	// 產生的 class names 輸出格式
	// - 'string': "pk-a pk-b pk-c"
	// - 'array':  ['pk-a', 'pk-b', 'pk-c']
	transformedFormat: 'string', // 預設值

	// 提供 autocomplete 的 TypeScript codegen 檔
	// - true:   產生 'pika.gen.ts'
	// - string: 自訂檔案路徑
	// - false:  停用
	tsCodegen: true, // 預設值 → 'pika.gen.ts'

	// 包含所有 atomic styles 的 CSS codegen 檔
	// - true:   產生 'pika.gen.css'
	// - string: 自訂檔案路徑
	cssCodegen: true, // 預設值 → 'pika.gen.css'
}
