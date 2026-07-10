const buttonVariants = {
	primary: pika({
		backgroundColor: '#3b82f6',
		color: 'white',
	}),
	danger: pika({
		backgroundColor: '#ef4444',
		color: 'white',
	}),
}

// Selecting a variant at runtime is plain object access —
// every pika() call above was already compiled at build time.
export function buttonClass(kind: keyof typeof buttonVariants) {
	return buttonVariants[kind]
}
