// Quick-suggest regression harness for the playground Monaco editor.
//
// Measures:
//   (a) as-you-type suggest-widget visibility rate (real CDP key events)
//   (b) post-edit TS worker completion latency (executeEdits -> completions)
// plus sanity metrics (extraLib count, kept-root estimate, marker count).
//
// Prereqs: `pnpm --filter @pikacss/playground dev` running on :5173 and the
// `agent-browser` CLI installed. Run: `node playground/scripts/bench-suggest.mjs`
//
// History: originally a 4-arm A/B (?__arm=base|trim|ectx|both). The 2026-07
// run shipped the `trim` custom TS worker (post-edit completion latency median
// 49ms -> 21ms, p90 130ms -> 27ms, extra-lib program roots 837 -> 81, zero
// marker regressions) and rejected `editContext: false` (no measurable win).
// Suggest-widget visibility during *sustained* typing bursts is unchanged by
// any arm (Monaco-inherent; widget shows reliably once typing pauses). The
// `?__arm` switch has been removed from the app; the arms argv is vestigial.
//
// Design notes: fast-pace typing uses a single `agent-browser keyboard type`
// invocation (per-char key events without process-spawn jitter between chars);
// slow pace spaces single-char invocations with sleeps. Fresh page load per
// arm block; blocks run in mirrored order to cancel machine-load drift.

import { execFileSync } from 'node:child_process'
import process from 'node:process'

const BASE_URL = process.env.BENCH_URL ?? 'http://localhost:5173/playground/solid-ts/'
const ARMS = process.argv.slice(2).length ? process.argv.slice(2) : ['base', 'trim', 'ectx', 'both']
const FAST_TRIALS = Number(process.env.BENCH_FAST_TRIALS ?? 25)
const SLOW_TRIALS = Number(process.env.BENCH_SLOW_TRIALS ?? 10)
const LATENCY_SAMPLES = Number(process.env.BENCH_LATENCY_SAMPLES ?? 20)
const WORD = 'windo' // identifier prefix with guaranteed completions (window, ...)

function ab(args, timeoutMs = 30000) {
	return execFileSync('agent-browser', args, { encoding: 'utf-8', timeout: timeoutMs })
}

function abEval(js, timeoutMs = 60000) {
	const out = ab(['eval', js, '--json'], timeoutMs)
	const parsed = JSON.parse(out)
	// agent-browser --json wraps as { success, data: { result } } (observed); be lenient.
	return parsed?.data?.result ?? parsed?.result ?? parsed
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

function wilson(successes, n) {
	if (n === 0)
		return { rate: 0, lo: 0, hi: 0 }
	const z = 1.96
	const p = successes / n
	const denom = 1 + z * z / n
	const center = (p + z * z / (2 * n)) / denom
	const margin = z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n) / denom
	return { rate: p, lo: Math.max(0, center - margin), hi: Math.min(1, center + margin) }
}

function median(xs) {
	const s = [...xs].sort((a, b) => a - b)
	return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}

function p90(xs) {
	const s = [...xs].sort((a, b) => a - b)
	return s[Math.min(s.length - 1, Math.ceil(s.length * 0.9) - 1)]
}

async function openArm(arm) {
	ab(['open', `${BASE_URL}?__arm=${arm}&__bench`], 60000)
	const deadline = Date.now() + 240000
	while (Date.now() < deadline) {
		try {
			if (abEval('!!window.__benchReady') === true)
				return
		}
		catch {}
		await sleep(3000)
	}
	throw new Error(`arm ${arm}: __benchReady timeout`)
}

function sanity() {
	return abEval(`(() => {
		const m = window.__monaco
		const libs = Object.keys(m.languages.typescript.typescriptDefaults.getExtraLibs())
		const keep = f => !f.startsWith('file:///node_modules/')
			|| (f.startsWith('file:///node_modules/@types/') && /\\.d\\.[mc]?ts$/.test(f))
			|| f === 'file:///node_modules/vite/client.d.ts'
		return {
			totalLibs: libs.length,
			keptRootEstimate: libs.filter(keep).length,
			models: m.editor.getModels().length,
			markers: m.editor.getModelMarkers({}).length,
		}
	})()`)
}

function measureLatency(n) {
	// Times postMessage roundtrip + mirror-model apply + program update against
	// the current root set + completion computation — the cold post-edit path.
	return abEval(`(async () => {
		const monaco = window.__monaco, ed = window.__ed, model = ed.getModel()
		const getWorker = await monaco.languages.typescript.getTypeScriptWorker()
		const worker = await getWorker(model.uri)
		const samples = []
		for (let i = 0; i < ${n + 1}; i++) {
			const pos = ed.getPosition()
			ed.executeEdits('bench', [{ range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column), text: 'x' }])
			const offset = model.getOffsetAt(ed.getPosition())
			const t0 = performance.now()
			await worker.getCompletionsAtPosition(model.uri.toString(), offset)
			samples.push(performance.now() - t0)
			ed.trigger('bench', 'undo')
			await new Promise(r => setTimeout(r, 120))
		}
		return samples.slice(1)
	})()`, 120000)
}

function resetForTrial() {
	abEval(`(() => {
		const ed = window.__ed
		ed.focus()
		const m = ed.getModel()
		const l = m.getLineCount()
		ed.setPosition({ lineNumber: l, column: m.getLineMaxColumn(l) })
		return 1
	})()`)
	ab(['press', 'Escape'])
	ab(['press', 'Enter'])
}

function widgetVisible() {
	return abEval(`!!document.querySelector('.monaco-editor .suggest-widget.visible')`) === true
}

function cleanupTrial(chars) {
	ab(['press', 'Escape'])
	abEval(`(() => { for (let i = 0; i < ${chars + 1}; i++) window.__ed.trigger('bench', 'undo'); return 1 })()`)
}

async function visibilityTrials(pace, trials) {
	let ok700 = 0
	let ok1500 = 0
	for (let i = 0; i < trials; i++) {
		resetForTrial()
		if (pace === 'fast') {
			// One invocation: real per-char key events, no spawn jitter between chars.
			ab(['keyboard', 'type', WORD])
		}
		else {
			for (const c of WORD) {
				ab(['keyboard', 'type', c])
				await sleep(350)
			}
		}
		await sleep(700)
		const v700 = widgetVisible()
		await sleep(800)
		const v1500 = v700 || widgetVisible()
		if (v700)
			ok700++
		if (v1500)
			ok1500++
		cleanupTrial(WORD.length)
	}
	return { ok700, ok1500, trials }
}

const results = {}
const order = [...ARMS, ...[...ARMS].reverse()]
const half = Math.ceil(FAST_TRIALS / 2)
const halfSlow = Math.ceil(SLOW_TRIALS / 2)

for (let block = 0; block < order.length; block++) {
	const arm = order[block]
	const fastN = block < ARMS.length ? half : FAST_TRIALS - half
	const slowN = block < ARMS.length ? halfSlow : SLOW_TRIALS - halfSlow
	if (fastN <= 0 && slowN <= 0)
		continue
	console.log(`\n=== block ${block + 1}/${order.length}: arm=${arm} (fast ${fastN}, slow ${slowN}) ===`)
	await openArm(arm)
	results[arm] ??= { fast: { ok700: 0, ok1500: 0, trials: 0 }, slow: { ok700: 0, ok1500: 0, trials: 0 }, latency: [], sanity: null }
	results[arm].sanity = sanity()
	console.log('sanity:', JSON.stringify(results[arm].sanity))
	const lat = measureLatency(Math.ceil(LATENCY_SAMPLES / 2))
	results[arm].latency.push(...lat)
	if (fastN > 0) {
		const f = await visibilityTrials('fast', fastN)
		results[arm].fast.ok700 += f.ok700
		results[arm].fast.ok1500 += f.ok1500
		results[arm].fast.trials += f.trials
		console.log(`fast: ${f.ok700}/${f.trials} @700ms, ${f.ok1500}/${f.trials} @1500ms`)
	}
	if (slowN > 0) {
		const s = await visibilityTrials('slow', slowN)
		results[arm].slow.ok700 += s.ok700
		results[arm].slow.ok1500 += s.ok1500
		results[arm].slow.trials += s.trials
		console.log(`slow: ${s.ok700}/${s.trials} @700ms, ${s.ok1500}/${s.trials} @1500ms`)
	}
}

console.log('\n===== RESULTS =====')
for (const arm of ARMS) {
	const r = results[arm]
	if (!r)
		continue
	const wf = wilson(r.fast.ok1500, r.fast.trials)
	const ws = wilson(r.slow.ok1500, r.slow.trials)
	console.log(`\narm=${arm}`)
	console.log(`  fast typing : ${r.fast.ok700}/${r.fast.trials} @700ms | ${r.fast.ok1500}/${r.fast.trials} @1500ms (${(wf.rate * 100).toFixed(0)}% CI ${(wf.lo * 100).toFixed(0)}–${(wf.hi * 100).toFixed(0)}%)`)
	console.log(`  slow typing : ${r.slow.ok700}/${r.slow.trials} @700ms | ${r.slow.ok1500}/${r.slow.trials} @1500ms (${(ws.rate * 100).toFixed(0)}% CI ${(ws.lo * 100).toFixed(0)}–${(ws.hi * 100).toFixed(0)}%)`)
	console.log(`  post-edit completion latency: median ${median(r.latency)
		.toFixed(1)}ms, p90 ${p90(r.latency)
		.toFixed(1)}ms (n=${r.latency.length})`)
	console.log(`  sanity: ${JSON.stringify(r.sanity)}`)
}
console.log(`\nJSON: ${JSON.stringify(results)}`)
