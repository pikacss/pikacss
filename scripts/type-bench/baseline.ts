import type { BenchSuite } from './types'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const BASELINES_DIR = resolve(import.meta.dirname, 'baselines')

export function baselinePath(name: string): string {
	return resolve(BASELINES_DIR, `${name}.json`)
}

export async function saveBaseline(name: string, suite: BenchSuite): Promise<string> {
	const filePath = baselinePath(name)
	await mkdir(dirname(filePath), { recursive: true })
	await writeFile(filePath, JSON.stringify(suite, null, 2), 'utf-8')
	return filePath
}

export async function loadBaseline(name: string): Promise<BenchSuite> {
	const filePath = baselinePath(name)
	const raw = await readFile(filePath, 'utf-8')
	return JSON.parse(raw) as BenchSuite
}

export interface BaselineDiff {
	scenario: string
	dimension: string
	dimensionValue: number | string
	metrics: MetricDiff[]
}

export interface MetricDiff {
	name: string
	baseline: number
	current: number
	change: number // absolute
	changePercent: number // percentage
	regression: boolean // true if change is >threshold
}

export interface BaselineComparison {
	baselineName: string
	baselineTs: string
	currentTs: string
	diffs: BaselineDiff[]
	regressions: BaselineDiff[]
}

export function compareToBaseline(
	baseline: BenchSuite,
	current: BenchSuite,
	baselineName: string,
	regressionThreshold = 10, // percent
): BaselineComparison {
	const diffs: BaselineDiff[] = []

	for (const currentResult of current.results) {
		const baseResult = baseline.results.find(
			b => b.dimension === currentResult.dimension
				&& String(b.dimensionValue) === String(currentResult.dimensionValue),
		)
		if (!baseResult)
			continue

		const metrics: MetricDiff[] = [
			diffMetric('types', baseResult.tsc.types, currentResult.tsc.types, regressionThreshold),
			diffMetric('instantiations', baseResult.tsc.instantiations, currentResult.tsc.instantiations, regressionThreshold),
			diffMetric('memoryUsed', baseResult.tsc.memoryUsed, currentResult.tsc.memoryUsed, regressionThreshold),
			diffMetric('checkTime', baseResult.tsc.checkTime, currentResult.tsc.checkTime, regressionThreshold),
		]

		diffs.push({
			scenario: currentResult.name,
			dimension: currentResult.dimension,
			dimensionValue: currentResult.dimensionValue,
			metrics,
		})
	}

	const regressions = diffs.filter(d => d.metrics.some(m => m.regression))

	return {
		baselineName,
		baselineTs: baseline.tsVersion,
		currentTs: current.tsVersion,
		diffs,
		regressions,
	}
}

function diffMetric(name: string, baseline: number, current: number, threshold: number): MetricDiff {
	const change = current - baseline
	const changePercent = baseline !== 0 ? (change / baseline) * 100 : 0
	return {
		name,
		baseline,
		current,
		change,
		changePercent,
		regression: changePercent > threshold,
	}
}
