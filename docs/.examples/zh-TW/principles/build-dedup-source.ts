// 兩個不同 component 使用相同的 CSS property-value 組合

// Button 元件
const btnClass = pika({
	color: 'white', // → class 'a'
	padding: '1rem', // → class 'b'
	cursor: 'pointer', // → class 'c'
})

// Link 元件：會共用 `color: white` 和 `cursor: pointer`
const linkClass = pika({
	color: 'white', // → 重用 class 'a'（相同的 property-value！）
	fontSize: '14px', // → class 'd'（新的）
	cursor: 'pointer', // → 重用 class 'c'（相同的 property-value！）
})
