// pika() 是全域函式，不需要另外匯入

// 用 pika() 來處理樣式的按鈕元件
const buttonClass = pika({
	padding: '0.5rem 1rem',
	borderRadius: '0.5rem',
	backgroundColor: '#0ea5e9',
	color: 'white',
	cursor: 'pointer',
})

document.querySelector('#btn')!.className = buttonClass
