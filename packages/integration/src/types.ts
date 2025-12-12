import type { Engine, EngineConfig, Nullish } from '@pikacss/core'
import type { Options as GlobbyOptions } from 'globby'
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
		patterns: string | readonly string[]
		options: Omit<GlobbyOptions, 'cwd' | 'objectMode'>
	}
	configOrPath: EngineConfig | string | Nullish
	fnName: string
	transformedFormat: 'string' | 'array' | 'inline'
	tsCodegen: false | string
	cssCodegen: string
	autoCreateConfig: boolean
}

export interface PrepareCreateIntegrationContextResult extends IntegrationContextOptions {
	cssCodegenFilepath: string
	tsCodegenFilepath: string | null
	loadConfig: () => Promise<
		| { config: EngineConfig, file: null }
		| { config: null, file: null }
		| { config: EngineConfig, file: string }
	>
	fnUtils: FnUtils
	findFunctionCalls: (code: string) => {
		fnName: string
		start: number
		end: number
		snippet: string
	}[]
	createTransformIncludeFn: (resolvedConfigPath: string | null) => (id: string) => boolean
}

export interface IntegrationContext {
	cwd: string
	currentPackageName: string
	fnName: string
	transformedFormat: 'string' | 'array' | 'inline'
	cssCodegenFilepath: string
	tsCodegenFilepath: string | Nullish
	hasVue: boolean
	usages: Map<string, UsageRecord[]>
	hooks: {
		styleUpdated: ReturnType<typeof createEventHook<void>>
		tsCodegenUpdated: ReturnType<typeof createEventHook<void>>
	}
	loadConfig: PrepareCreateIntegrationContextResult['loadConfig']
	resolvedConfigPath: string | Nullish
	engine: Engine
	transformInclude: (id: string) => boolean
	transform: (code: string, id: string) => Promise<{ code: string, map: SourceMap } | Nullish>
	getCssCodegenContent: (isDev: boolean) => Promise<string | Nullish>
	getTsCodegenContent: () => Promise<string | Nullish>
	writeCssCodegenFile: () => Promise<void>
	writeTsCodegenFile: () => Promise<void>
	fullyCssCodegen: () => Promise<void>
}
