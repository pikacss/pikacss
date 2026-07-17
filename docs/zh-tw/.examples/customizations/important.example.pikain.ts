const className = pika({
	color: 'red',
	fontSize: '16px',
})

// 即使 `important.default` 為 true，仍可針對個別定義選擇退出
const optOut = pika({
	__important: false,
	color: 'blue',
})
