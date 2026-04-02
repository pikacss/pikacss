import type { BaselineComparison } from '../baseline'
import type { BenchSuite, ScenarioResult, TraceSummary, TsserverLatencyReport, TsserverOperationResult } from '../types'

export function formatCliTable(suite: BenchSuite, comparison?: BaselineComparison): string {
	const lines: string[] = []

	lines.push(`PikaCSS Type Bench — ${suite.timestamp}`)
	lines.push(`TypeScript ${suite.tsVersion} | ${suite.runs} runs (median)`)
	lines.push('')

	// Group results by dimension
	const grouped = new Map<string, ScenarioResult[]>()
	for (const result of suite.results) {
		const group = grouped.get(result.dimension) ?? []
		group.push(result)
		grouped.set(result.dimension, group)
	}

	for (const [dimension, results] of grouped) {
		lines.push(`── ${dimension} ${'─'.repeat(60 - dimension.length)}`)
		lines.push('')
		lines.push(formatTable(results))
		lines.push('')

		// Show trace hotspots for the last scenario in each dimension (if available)
		const lastResult = results.at(-1)!
		if (lastResult.trace && lastResult.trace.hotTypes.length > 0) {
			lines.push(formatTraceSummary(lastResult.trace, lastResult.name))
			lines.push('')
		}

		// Show tsserver latency for the last scenario (if available)
		if (lastResult.tsserver && lastResult.tsserver.operations.length > 0) {
			lines.push(formatTsserverSummary(lastResult.tsserver, lastResult.name))
			lines.push('')
		}
	}

	if (comparison) {
		lines.push(formatBaselineComparison(comparison))
		lines.push('')
	}

	return lines.join('\n')
}

function formatBaselineComparison(comparison: BaselineComparison): string {
	const lines: string[] = []
	lines.push(`── Baseline Comparison: "${comparison.baselineName}" (TS ${comparison.baselineTs} → ${comparison.currentTs}) ──`)
	lines.push('')

	if (comparison.regressions.length > 0) {
		lines.push(`  ⚠ ${comparison.regressions.length} scenario(s) with regressions:`)
		lines.push('')
	}

	const headers = ['Scenario', 'Types', 'Instantiations', 'Memory', 'Check Time']
	const rows: string[][] = []
	for (const diff of comparison.diffs) {
		const cells = [diff.scenario]
		for (const metricName of ['types', 'instantiations', 'memoryUsed', 'checkTime']) {
			const m = diff.metrics.find(x => x.name === metricName)
			if (!m) {
				cells.push('-')
				continue
			}
			const sign = m.changePercent > 0 ? '+' : ''
			const pct = `${sign}${m.changePercent.toFixed(1)}%`
			const marker = m.regression ? ' ⚠' : ''
			cells.push(`${pct}${marker}`)
		}
		rows.push(cells)
	}

	const colWidths = headers.map((h, i) => {
		const maxRow = Math.max(...rows.map(r => r[i]!.length))
		return Math.max(h.length, maxRow)
	})

	const sep = colWidths.map(w => '─'.repeat(w + 2))
		.join('┼')
	lines.push(headers.map((h, i) => ` ${h.padEnd(colWidths[i]!)} `)
		.join('│'))
	lines.push(sep)
	for (const row of rows) {
		lines.push(row.map((cell, i) => ` ${cell.padStart(colWidths[i]!)} `)
			.join('│'))
	}

	return lines.join('\n')
}

function formatTable(results: ScenarioResult[]): string {
	const headers = ['Value', 'Types', 'Instantiations', 'Memory', 'Check Time']
	const rows = results.map(r => [
		String(r.dimensionValue),
		formatNumber(r.tsc.types),
		formatNumber(r.tsc.instantiations),
		formatBytes(r.tsc.memoryUsed),
		`${r.tsc.checkTime.toFixed(2)}s`,
	])

	const colWidths = headers.map((h, i) => {
		const maxRow = Math.max(...rows.map(r => r[i]!.length))
		return Math.max(h.length, maxRow)
	})

	const sep = colWidths.map(w => '─'.repeat(w + 2))
		.join('┼')
	const headerLine = headers.map((h, i) => ` ${h.padEnd(colWidths[i]!)} `)
		.join('│')
	const dataLines = rows.map(row =>
		row.map((cell, i) => ` ${cell.padStart(colWidths[i]!)} `)
			.join('│'),
	)

	return [
		headerLine,
		sep,
		...dataLines,
	].join('\n')
}

function formatNumber(n: number): string {
	return n.toLocaleString('en-US')
}

function formatBytes(bytes: number): string {
	if (bytes < 1024)
		return `${bytes}B`
	if (bytes < 1024 * 1024)
		return `${(bytes / 1024).toFixed(0)}K`
	return `${(bytes / (1024 * 1024)).toFixed(1)}M`
}

function formatTsserverSummary(report: TsserverLatencyReport, scenarioName: string): string {
	const lines: string[] = []
	lines.push(`  tsserver latency (${scenarioName}):`)

	// Group by operation
	const byOp = new Map<string, TsserverOperationResult[]>()
	for (const op of report.operations) {
		const key = `${op.probeKind} → ${op.operation}`
		const arr = byOp.get(key) ?? []
		arr.push(op)
		byOp.set(key, arr)
	}

	const maxKeyLen = Math.max(...Array.from(byOp.keys(), k => k.length), 20)
	for (const [key, ops] of byOp) {
		const first = ops[0]!
		const p50 = first.p50 ?? first.latencyMs
		const p95 = first.p95 ?? first.latencyMs
		const label = key.padEnd(maxKeyLen)
		lines.push(`    ${label}  p50=${p50.toFixed(0)}ms  p95=${p95.toFixed(0)}ms`)
	}

	return lines.join('\n')
}

function formatTraceSummary(trace: TraceSummary, scenarioName: string): string {
	const lines: string[] = []
	lines.push(`  Trace hotspots (${scenarioName}, top ${trace.hotTypes.length}):`)

	const maxNameLen = Math.max(...trace.hotTypes.map(h => h.name.length), 20)
	for (const hot of trace.hotTypes) {
		const name = hot.name.padEnd(maxNameLen)
		const time = `${hot.totalTime.toFixed(1)}ms`.padStart(10)
		const count = `×${hot.count}`.padStart(8)
		lines.push(`    ${name} ${time} ${count}`)
	}

	return lines.join('\n')
}
