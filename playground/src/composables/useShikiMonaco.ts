import { createHighlighterCore } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import langVue from '@shikijs/langs/vue'
import { shikiToMonaco } from '@shikijs/monaco'
import themeDarkPlus from '@shikijs/themes/dark-plus'
import * as monaco from 'monaco-editor'

// TextMate-based highlighting for Monaco via shiki. Monaco has no built-in
// `vue` language; the vue grammar (plus its embedded html/css/ts/js/json
// grammars) is loaded with the JS regex engine so no oniguruma wasm is needed.
// `shikiToMonaco` replaces the tokenizer of every monaco-registered language
// the highlighter has loaded — tokenization only; TS worker features (markers,
// hover, completions) are unaffected.

const SHIKI_THEME = 'dark-plus'
let currentTheme = 'vs-dark'
let initPromise: Promise<void> | null = null

/**
 * The theme new editors should be created with. After `shikiToMonaco` runs it
 * patches `monaco.editor.create` to call `setTheme(options.theme)`, which
 * throws for themes the highlighter does not know — so once shiki is ready,
 * only the shiki theme may be passed to `create`.
 */
export function getEditorTheme() {
	return currentTheme
}

export function setupShikiMonaco(): Promise<void> {
	if (initPromise)
		return initPromise

	// Register `vue` synchronously so models created before the highlighter is
	// ready already carry the right language id (tokens apply once registered).
	monaco.languages.register({ id: 'vue' })

	initPromise = (async () => {
		const highlighter = await createHighlighterCore({
			themes: [themeDarkPlus],
			langs: [langVue],
			engine: createJavaScriptRegexEngine(),
		})
		shikiToMonaco(highlighter, monaco)
		// shikiToMonaco already switched the global theme to the first loaded one.
		currentTheme = SHIKI_THEME
	})()
		.catch((error) => {
			console.error('[shiki] Failed to set up monaco highlighting:', error)
		})
	return initPromise
}
