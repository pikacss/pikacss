import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',

	// 非同步：在 engine 建立後呼叫
	configureEngine: async (engine) => {
		// 加入 CSS 變數
		engine.variables.add({
			'--brand-color': '#0ea5e9',
		})

		// 加入 shortcuts
		engine.shortcuts.add([
			'flex-center',
			{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			},
		])

		// 加入自訂 selectors
		engine.selectors.add(['hover', '$:hover'])

		// 加入 keyframe 動畫
		engine.keyframes.add([
			'fade-in',
			{ from: { opacity: '0' }, to: { opacity: '1' } },
			['fade-in 0.3s ease'],
		])

		// 加入 preflight CSS
		engine.addPreflight('*, *::before, *::after { box-sizing: border-box; }')
	},
})
