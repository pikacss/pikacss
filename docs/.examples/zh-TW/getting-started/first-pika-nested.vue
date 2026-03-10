<template>
	<button
		:class="pika({
			'padding': '0.5em 1em',
			'borderRadius': '0.25em',
			'border': 'none',
			'backgroundColor': '#0ea5e9',
			'color': 'white',
			'cursor': 'pointer',
			'transition': 'transform 0.2s ease',

			':hover': {
				transform: 'scale(1.05)',
			},

			':active': {
				transform: 'scale(0.95)',
			},
		})"
	>
		Hover me
	</button>
</template>
