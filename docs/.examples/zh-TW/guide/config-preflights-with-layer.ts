import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	layers: {
		reset: 0,
		base: 1,
		utilities: 10,
	},
	preflights: [
		// WithLayer 搭配 CSS 字串
		{
			layer: 'reset',
			preflight: '*, *::before, *::after { box-sizing: border-box; }',
		},

		// WithLayer 搭配 preflight definition object
		{
			layer: 'base',
			preflight: {
				':root': {
					fontSize: '16px',
					lineHeight: '1.5',
				},
			},
		},

		// WithLayer 搭配動態函式
		{
			layer: 'base',
			preflight: (engine) => {
				const prefix = engine.config.prefix
				return `/* Engine prefix：${prefix} */`
			},
		},
	],
})
