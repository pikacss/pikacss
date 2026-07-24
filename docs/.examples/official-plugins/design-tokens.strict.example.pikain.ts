// Valid usage under strict mode: a governed property references a token of the
// matching $type, so no diagnostic is produced and the CSS emits normally.
const buttonClassName = pika({
	color: 'var(--color-primary)',
	backgroundColor: 'var(--color-surface)',
})
