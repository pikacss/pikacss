// pika() 是全域函式，不需要另外匯入

const btn = pika({
	'color': 'black',
	// 偽類 selector
	'&:hover': {
		color: 'blue',
	},
	// media query
	'@media (max-width: 768px)': {
		fontSize: '14px',
	},
})
