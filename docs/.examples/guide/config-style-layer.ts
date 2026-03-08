import { defineStyleDefinition } from '@pikacss/core'

export const card = defineStyleDefinition({
	__layer: 'components',
	borderRadius: '1rem',
	padding: '1.5rem',
	backgroundColor: 'white',
	':hover': {
		boxShadow: '0 12px 32px rgb(0 0 0 / 0.12)',
	},
})

export const stack = defineStyleDefinition({
	display: 'grid',
	gap: '1rem',
})

// card styles render into @layer components
// stack styles render into defaultUtilitiesLayer
pika(card, stack)