const className = pika({
	color: 'red',
	fontSize: '16px',
})

// Opt out per definition, even when `important.default` is true
const optOut = pika({
	__important: false,
	color: 'blue',
})
