import type { ProcessedCssData } from './types'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'pathe'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const PROCESSED_CSS_DATA_PATH = path.resolve(__dirname, 'generated', 'generated-css-data.json')

export function loadProcessedCssData(dataPath = PROCESSED_CSS_DATA_PATH): ProcessedCssData {
	if (!fs.existsSync(dataPath)) {
		throw new Error(`Missing processed CSS data at ${dataPath}. Run \`pnpm generate:css-data\` first.`)
	}

	return JSON.parse(fs.readFileSync(dataPath, 'utf8')) as ProcessedCssData
}

export function writeProcessedCssData(data: ProcessedCssData, dataPath = PROCESSED_CSS_DATA_PATH): void {
	fs.mkdirSync(path.dirname(dataPath), { recursive: true })
	fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`)
}
