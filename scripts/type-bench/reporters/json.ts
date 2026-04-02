import type { BenchSuite } from '../types'
import { writeFile } from 'node:fs/promises'

export async function writeJsonReport(suite: BenchSuite, outputPath: string): Promise<void> {
	await writeFile(outputPath, JSON.stringify(suite, null, '\t'))
}
