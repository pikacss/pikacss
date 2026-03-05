import { defineStyleDefinition } from '@pikacss/core'

// Properties form: flat CSS property-value pairs
const flatStyle = defineStyleDefinition({
	color: 'var(--color-text)',
	fontSize: '1rem',
	fontWeight: '400',
})

// StyleDefinitionMap form: selector-keyed nested rules
// Keys are selector strings — aliases from config.selectors or plain CSS selectors
const nestedStyle = defineStyleDefinition({
	color: 'var(--color-text)',
	hover: {
		color: 'var(--color-primary)',
		textDecoration: 'underline',
	},
	'&:focus-visible': {
		outline: '2px solid var(--color-primary)',
		outlineOffset: '2px',
	},
})

export { flatStyle, nestedStyle }
