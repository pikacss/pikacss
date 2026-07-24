const badgeClassName = pika({
	// `brand` 是指向 color.primary 的 $ref 別名；使用它可以讓目標保持存活。
	color: 'var(--color-brand)',
	// `legacy` 已被 $deprecated 標記，但仍會輸出它的變數。
	backgroundColor: 'var(--color-legacy)',
})
