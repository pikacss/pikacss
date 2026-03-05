import { defineStyleDefinition } from '@pikacss/core'

// defineStyleDefinition() is a type-safe identity helper for style definition objects.
// Use it when you want to define a reusable style object outside of a pika() call,
// with full TypeScript autocomplete and type checking.
const buttonBase = defineStyleDefinition({
	padding: '0.5rem 1rem',
	borderRadius: '0.25rem',
	cursor: 'pointer',
	border: 'none',
	fontSize: '1rem',
})

// Pass the typed definition directly to pika()
const cls = pika(buttonBase)
