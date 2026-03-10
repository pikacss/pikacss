// 在一般 JS/TS 中，pika() 是全域函式
// 只要完成 build plugin 設定後就能直接使用。

const className = pika({
	padding: '0.5rem 1rem',
	borderRadius: '0.5rem',
	backgroundColor: '#0ea5e9',
	color: 'white',
	border: 'none',
	cursor: 'pointer',
	fontSize: '1rem',
})

// 把回傳的 class name(s) 套用到任意 DOM element 上
document.querySelector('#my-button')!.className = className
