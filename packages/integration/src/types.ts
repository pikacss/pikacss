import type { Engine, EngineConfig, Nullish } from '@pikacss/core'
import type { SourceMap } from 'magic-string'
import type { createEventHook } from './eventHook'

export interface UsageRecord {
	atomicStyleIds: string[]
	params: Parameters<Engine['use']>
}

export interface FnUtils {
	isNormal: (fnName: string) => boolean
	isForceString: (fnName: string) => boolean
	isForceArray: (fnName: string) => boolean
	isForceInline: (fnName: string) => boolean
	isPreview: (fnName: string) => boolean
	RE: RegExp
}

export interface IntegrationContextOptions {
	cwd: string
	currentPackageName: string
	scan: {
		include: string[]
		exclude: string[]
	}
	configOrPath: EngineConfig | string | Nullish
	fnName: string
	transformedFormat: 'string' | 'array' | 'inline'
	tsCodegen: false | string
	cssCodegen: string
	autoCreateConfig: boolean
}

export interface IntegrationContext {
	cwd: string
	currentPackageName: string
	fnName: string
	transformedFormat: 'string' | 'array' | 'inline'
	cssCodegenFilepath: string
	tsCodegenFilepath: string | Nullish
	hasVue: boolean
	resolvedConfig: EngineConfig | Nullish
	resolvedConfigPath: string | Nullish
	loadConfig: () => Promise<
		| { config: EngineConfig, file: null }
		| { config: null, file: null }
		| { config: EngineConfig, file: string }
	>
	usages: Map<string, UsageRecord[]>
	hooks: {
		styleUpdated: ReturnType<typeof createEventHook<void>>
		tsCodegenUpdated: ReturnType<typeof createEventHook<void>>
	}
	engine: Engine
	transformFilter: {
		include: string[]
		exclude: string[]
	}
	transform: (code: string, id: string) => Promise<{ code: string, map: SourceMap } | Nullish>
	getCssCodegenContent: () => Promise<string | Nullish>
	getTsCodegenContent: () => Promise<string | Nullish>
	writeCssCodegenFile: () => Promise<void>
	writeTsCodegenFile: () => Promise<void>
	fullyCssCodegen: () => Promise<void>
	setupPromise: Promise<void> | null
	setup: () => Promise<void>
}
