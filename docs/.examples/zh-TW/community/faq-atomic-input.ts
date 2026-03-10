// pika() 是全域函式，不需要另外匯入

const btn = pika({
	color: 'white',
	backgroundColor: 'blue',
})

const link = pika({
	color: 'white',
	textDecoration: 'underline',
})

// `btn` 和 `link` 會共用 `color: white` 對應的 atomic class
