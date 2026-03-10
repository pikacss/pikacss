// 方法 1：在 __shortcut 中以字串 style item 使用 shortcut
const className = pika({
	__shortcut: 'flex-center',
	gap: '1rem',
})

// 方法 2：一次套用多個 shortcuts
const multi = pika({
	__shortcut: ['flex-center', 'btn-base'],
	backgroundColor: '#0ea5e9',
})

// 方法 3：動態 shortcuts 會根據 pattern 解析
const spacing = pika({
	__shortcut: 'm-4',
})
