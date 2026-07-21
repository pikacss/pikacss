import { describe, expect, it, vi } from 'vitest'
import { icons } from './index'

function createEngine() {
	return {
		config: { prefix: 'pk-' },
		appendAutocomplete: vi.fn(),
		shortcuts: { add: vi.fn() },
		variables: { store: new Map(), add: vi.fn() },
		reportDiagnostic: vi.fn(),
	}
}

describe('neutral icons entry', () => {
	it('registers without a Node.js local loader', async () => {
		const engine = createEngine()
		const plugin = icons()
		await plugin.configureRawConfig?.({ icons: {} } as any)
		await plugin.configureEngine?.(engine as any)
		expect(engine.shortcuts.add)
			.toHaveBeenCalledTimes(1)
	})
})
