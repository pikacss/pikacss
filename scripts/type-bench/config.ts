import type { FileSpread, ScenarioParams } from './types'

export interface DimensionScale<T = number | string> {
	values: T[]
	baseline: T
}

export interface BenchConfig {
	dimensions: {
		callCount: DimensionScale<number>
		pluginCount: DimensionScale<number>
		autocompleteSize: DimensionScale<number>
		nestingDepth: DimensionScale<number>
		fileSpread: DimensionScale<FileSpread>
	}
	runs: number
}

export const defaultConfig: BenchConfig = {
	dimensions: {
		callCount: {
			values: [10, 50, 200, 500, 1000],
			baseline: 50,
		},
		pluginCount: {
			values: [0, 1, 3, 5],
			baseline: 1,
		},
		autocompleteSize: {
			values: [10, 50, 200],
			baseline: 50,
		},
		nestingDepth: {
			values: [1, 2, 3, 4],
			baseline: 1,
		},
		fileSpread: {
			values: ['single', '10files', '50files'],
			baseline: 'single',
		},
	},
	runs: 5,
}

export function getBaselineParams(config: BenchConfig): ScenarioParams {
	return {
		callCount: config.dimensions.callCount.baseline,
		pluginCount: config.dimensions.pluginCount.baseline,
		autocompleteSize: config.dimensions.autocompleteSize.baseline,
		nestingDepth: config.dimensions.nestingDepth.baseline,
		fileSpread: config.dimensions.fileSpread.baseline as FileSpread,
	}
}

export type DimensionName = keyof BenchConfig['dimensions']

export function generateScenarios(config: BenchConfig, dimensionFilter?: DimensionName): Array<{ name: string, dimension: string, params: ScenarioParams }> {
	const baseline = getBaselineParams(config)
	const scenarios: Array<{ name: string, dimension: string, params: ScenarioParams }> = []

	for (const [dimName, dimScale] of Object.entries(config.dimensions)) {
		if (dimensionFilter && dimName !== dimensionFilter)
			continue

		for (const value of dimScale.values) {
			const params = { ...baseline, [dimName]: value }
			const name = `${dimName}=${value}`
			scenarios.push({ name, dimension: dimName, params })
		}
	}

	return scenarios
}
