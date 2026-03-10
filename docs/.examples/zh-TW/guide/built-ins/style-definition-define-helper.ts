import { defineStyleDefinition } from '@pikacss/core'

// defineStyleDefinition() 是具型別安全的 identity helper，用來定義 style definition objects。
// 當你想在 pika() 呼叫之外先定義可重用的 style object 時，可以使用它，
// 並同時保有完整的 TypeScript autocomplete 與型別檢查。
const buttonBase = defineStyleDefinition({
	padding: '0.5rem 1rem',
	borderRadius: '0.25rem',
	cursor: 'pointer',
	border: 'none',
	fontSize: '1rem',
})

// 可以把這份具型別的 definition 直接傳給 pika()
const cls = pika(buttonBase)
