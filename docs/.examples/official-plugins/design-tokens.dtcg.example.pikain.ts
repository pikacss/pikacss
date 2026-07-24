const badgeClassName = pika({
	// `brand` is a $ref alias to color.primary; using it keeps the target alive.
	color: 'var(--color-brand)',
	// `legacy` is $deprecated but still emits its variable.
	backgroundColor: 'var(--color-legacy)',
})
