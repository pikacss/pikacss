import { defineEngineConfig, defineKeyframes } from '@pikacss/core'

// defineKeyframes() is a type-safe identity helper for keyframe definitions.
// Useful when organizing animations in separate files.
const fadeIn = defineKeyframes(['fade-in', {
	from: { opacity: '0' },
	to: { opacity: '1' },
}, ['fade-in 0.3s ease']])

const slideUp = defineKeyframes({
	name: 'slide-up',
	frames: {
		from: { transform: 'translateY(100%)' },
		to: { transform: 'translateY(0)' },
	},
	autocomplete: ['slide-up 0.5s ease-out'],
})

export default defineEngineConfig({
	keyframes: {
		keyframes: [fadeIn, slideUp],
	},
})
