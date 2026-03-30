import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { join } from 'pathe'
import ts from 'typescript'
import {
	normalizePackageScope,
	PACKAGES,
	readMultiValueOption,
	workspaceRoot,
} from '../_skill-shared'

const EXCLUDED_PATTERNS = ['.test.ts', '.spec.ts', 'pika.gen.', 'csstype.ts', 'generated-']

// ── TS program creation (mirrors gen-api-docs) ──

function createApiProgram(): ts.Program {
	const entries = PACKAGES.map(pkg => join(workspaceRoot, 'packages', pkg.dir, 'src/index.ts'))
	const pathsMappings: Record<string, string[]> = {}

	for (const pkg of PACKAGES) {
		pathsMappings[pkg.name] = [join(workspaceRoot, 'packages', pkg.dir, 'src/index.ts')]
		pathsMappings[`${pkg.name}/*`] = [join(workspaceRoot, 'packages', pkg.dir, 'src/*')]
	}

	return ts.createProgram(entries, {
		target: ts.ScriptTarget.ESNext,
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		strict: true,
		skipLibCheck: true,
		noEmit: true,
		esModuleInterop: true,
		baseUrl: workspaceRoot,
		paths: pathsMappings,
	})
}

// ── Helpers ──

function getLineIndent(text: string, pos: number): string {
	let lineStart = pos
	while (lineStart > 0 && text[lineStart - 1] !== '\n')
		lineStart--
	const lineText = text.slice(lineStart, pos)
	return lineText.match(/^(\s*)/)?.[1] || ''
}

function isPrivateOrProtected(node: ts.Node): boolean {
	if (!ts.canHaveModifiers(node))
		return false
	const modifiers = ts.getModifiers(node)
	return modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword) ?? false
}

function hasExportModifier(node: ts.Node): boolean {
	if (!ts.canHaveModifiers(node))
		return false
	const modifiers = ts.getModifiers(node)
	return modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ?? false
}

function hasInternalTag(node: ts.Node): boolean {
	const jsDocs: ts.JSDoc[] | undefined = (node as any).jsDoc
	if (!jsDocs)
		return false
	return jsDocs.some(doc => doc.tags?.some(tag => tag.tagName.text === 'internal'))
}

// ── JSDoc range extraction ──

interface JSDocRange {
	start: number
	end: number
}

function getJSDocRange(node: ts.Node, sourceText: string): JSDocRange | null {
	const jsDocs: ts.JSDoc[] | undefined = (node as any).jsDoc
	if (!jsDocs || jsDocs.length === 0)
		return null

	const sourceFile = node.getSourceFile()
	let start = jsDocs[0]!.getStart(sourceFile)
	let end = jsDocs[jsDocs.length - 1]!.getEnd()

	// Extend start to beginning of line (include leading indentation)
	while (start > 0 && sourceText[start - 1] !== '\n')
		start--

	// Extend end past trailing whitespace and one newline
	while (end < sourceText.length && (sourceText[end] === ' ' || sourceText[end] === '\t'))
		end++
	if (end < sourceText.length && sourceText[end] === '\r')
		end++
	if (end < sourceText.length && sourceText[end] === '\n')
		end++

	return { start, end }
}

// ── Template generation ──

function buildJSDocBlock(lines: string[], indent: string): string {
	if (lines.length === 1) {
		return `${indent}/** ${lines[0]} */\n`
	}
	const parts = [`${indent}/**`]
	for (const line of lines) {
		parts.push(line ? `${indent} * ${line}` : `${indent} *`)
	}
	parts.push(`${indent} */`)
	return `${parts.join('\n')}\n`
}

function functionTemplate(
	name: string,
	params: { name: string }[],
	typeParams: string[],
	hasNonVoidReturn: boolean,
	isInternal: boolean,
	indent: string,
): string {
	const lines: string[] = [`@todo FILL: describe ${name}`]
	if (isInternal)
		lines.push('@internal')
	lines.push('')
	for (const tp of typeParams) {
		lines.push(`@typeParam ${tp} - @todo FILL: describe ${tp}`)
	}
	for (const p of params) {
		lines.push(`@param ${p.name} - @todo FILL: describe ${p.name}`)
	}
	if (hasNonVoidReturn) {
		lines.push(`@returns @todo FILL: return value`)
	}
	lines.push('')
	lines.push(`@remarks @todo FILL: remarks for ${name}`)
	lines.push('')
	lines.push('@example')
	lines.push('```ts')
	lines.push(`@todo FILL: example for ${name}`)
	lines.push('```')
	return buildJSDocBlock(lines, indent)
}

function interfaceSummaryTemplate(name: string, typeParams: string[], isInternal: boolean, indent: string): string {
	const lines: string[] = [`@todo FILL: describe ${name}`]
	if (isInternal)
		lines.push('@internal')
	if (typeParams.length > 0) {
		lines.push('')
		for (const tp of typeParams) {
			lines.push(`@typeParam ${tp} - @todo FILL: describe ${tp}`)
		}
	}
	lines.push('')
	lines.push(`@remarks @todo FILL: remarks for ${name}`)
	lines.push('')
	lines.push('@example')
	lines.push('```ts')
	lines.push(`@todo FILL: example for ${name}`)
	lines.push('```')
	return buildJSDocBlock(lines, indent)
}

function memberTemplate(name: string, isOptional: boolean, indent: string): string {
	if (!isOptional) {
		return buildJSDocBlock([`@todo FILL: describe ${name}`], indent)
	}
	return buildJSDocBlock([
		`@todo FILL: describe ${name}`,
		'',
		`@default @todo FILL: default`,
	], indent)
}

function typeAliasTemplate(name: string, typeParams: string[], isInternal: boolean, indent: string): string {
	const lines: string[] = [`@todo FILL: describe ${name}`]
	if (isInternal)
		lines.push('@internal')
	if (typeParams.length > 0) {
		lines.push('')
		for (const tp of typeParams) {
			lines.push(`@typeParam ${tp} - @todo FILL: describe ${tp}`)
		}
	}
	lines.push('')
	lines.push(`@remarks @todo FILL: remarks for ${name}`)
	lines.push('')
	lines.push('@example')
	lines.push('```ts')
	lines.push(`@todo FILL: example for ${name}`)
	lines.push('```')
	return buildJSDocBlock(lines, indent)
}

function constTemplate(name: string, isInternal: boolean, indent: string): string {
	const lines: string[] = [`@todo FILL: describe ${name}`]
	if (isInternal)
		lines.push('@internal')
	lines.push(
		'',
		`@remarks @todo FILL: remarks for ${name}`,
		'',
		'@example',
		'```ts',
		`@todo FILL: example for ${name}`,
		'```',
	)
	return buildJSDocBlock(lines, indent)
}

function classTemplate(name: string, typeParams: string[], isInternal: boolean, indent: string): string {
	const lines: string[] = [`@todo FILL: describe ${name}`]
	if (isInternal)
		lines.push('@internal')
	if (typeParams.length > 0) {
		lines.push('')
		for (const tp of typeParams) {
			lines.push(`@typeParam ${tp} - @todo FILL: describe ${tp}`)
		}
	}
	lines.push('')
	lines.push(`@remarks @todo FILL: remarks for ${name}`)
	lines.push('')
	lines.push('@example')
	lines.push('```ts')
	lines.push(`@todo FILL: example for ${name}`)
	lines.push('```')
	return buildJSDocBlock(lines, indent)
}

function getTypeParamNames(node: ts.FunctionDeclaration | ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.ClassDeclaration | ts.ArrowFunction | ts.FunctionExpression): string[] {
	return (node.typeParameters || []).map(tp => tp.name.text)
}

// ── Modification types ──

interface Modification {
	start: number
	end: number
	text: string
}

// ── Insertion point calculation ──

function getInsertionPoint(node: ts.Node, sourceText: string): number {
	const pos = node.getStart(node.getSourceFile())
	let lineStart = pos
	while (lineStart > 0 && sourceText[lineStart - 1] !== '\n')
		lineStart--
	return lineStart
}

// ── Package scaffolding ──

interface ScaffoldResult {
	filesModified: number
	todosInserted: number
}

async function scaffoldPackage(
	pkgDef: typeof PACKAGES[number],
	program: ts.Program,
	checker: ts.TypeChecker,
): Promise<ScaffoldResult> {
	// Group modifications by file
	const fileModifications = new Map<string, Modification[]>()

	function addMod(filePath: string, mod: Modification) {
		if (!fileModifications.has(filePath))
			fileModifications.set(filePath, [])
		fileModifications.get(filePath)!.push(mod)
	}

	function addOrReplace(filePath: string, node: ts.Node, sourceText: string, template: string) {
		const existingRange = getJSDocRange(node, sourceText)
		if (existingRange) {
			addMod(filePath, { start: existingRange.start, end: existingRange.end, text: template })
		}
		else {
			const insertAt = getInsertionPoint(node, sourceText)
			addMod(filePath, { start: insertAt, end: insertAt, text: template })
		}
	}

	// ── Walk all source files ──

	const pkgSourceFiles = program.getSourceFiles()
		.filter(sf =>
			sf.fileName.includes(`/packages/${pkgDef.dir}/src/`)
			&& !EXCLUDED_PATTERNS.some(p => sf.fileName.includes(p)),
		)

	for (const sf of pkgSourceFiles) {
		const sourceText = sf.getFullText()

		for (const stmt of sf.statements) {
			// Handle module augmentation members
			if (ts.isModuleDeclaration(stmt) && ts.isStringLiteral(stmt.name) && stmt.body && ts.isModuleBlock(stmt.body)) {
				for (const innerStmt of stmt.body.statements) {
					if (!ts.isInterfaceDeclaration(innerStmt))
						continue
					for (const member of innerStmt.members) {
						if (!ts.isPropertySignature(member))
							continue
						const memberName = member.name?.getText() || ''
						const isOptional = !!member.questionToken
						const memberIndent = getLineIndent(sourceText, member.getStart(sf))
						const template = memberTemplate(memberName, isOptional, memberIndent)
						addOrReplace(sf.fileName, member, sourceText, template)
					}
				}
				continue
			}

			// Skip non-exported declarations
			if (!hasExportModifier(stmt))
				continue
			const isInternal = hasInternalTag(stmt)

			// Handle FunctionDeclaration
			if (ts.isFunctionDeclaration(stmt) && stmt.name) {
				const name = stmt.name.text
				const indent = getLineIndent(sourceText, stmt.getStart(sf))
				const params = stmt.parameters.map(p => ({ name: p.name.getText() }))
				const typeParams = getTypeParamNames(stmt)
				let nonVoidReturn = true
				const sym = checker.getSymbolAtLocation(stmt.name)
				if (sym) {
					const type = checker.getTypeOfSymbolAtLocation(sym, stmt)
					const sigs = checker.getSignaturesOfType(type, ts.SignatureKind.Call)
					if (sigs[0]) {
						const returnType = checker.getReturnTypeOfSignature(sigs[0])
						nonVoidReturn = !(returnType.getFlags() & ts.TypeFlags.Void)
					}
				}
				const template = functionTemplate(name, params, typeParams, nonVoidReturn, isInternal, indent)
				addOrReplace(sf.fileName, stmt, sourceText, template)
			}
			// Handle InterfaceDeclaration
			else if (ts.isInterfaceDeclaration(stmt)) {
				const name = stmt.name.text
				const indent = getLineIndent(sourceText, stmt.getStart(sf))
				const typeParams = getTypeParamNames(stmt)
				const template = interfaceSummaryTemplate(name, typeParams, isInternal, indent)
				addOrReplace(sf.fileName, stmt, sourceText, template)

				// Process interface members
				for (const member of stmt.members) {
					if (!ts.isPropertySignature(member))
						continue
					const memberName = member.name?.getText() || ''
					const isOptional = !!member.questionToken
					const memberIndent = getLineIndent(sourceText, member.getStart(sf))
					const memberTmpl = memberTemplate(memberName, isOptional, memberIndent)
					addOrReplace(sf.fileName, member, sourceText, memberTmpl)
				}
			}
			// Handle TypeAliasDeclaration
			else if (ts.isTypeAliasDeclaration(stmt)) {
				const name = stmt.name.text
				const indent = getLineIndent(sourceText, stmt.getStart(sf))
				const typeParams = getTypeParamNames(stmt)
				const template = typeAliasTemplate(name, typeParams, isInternal, indent)
				addOrReplace(sf.fileName, stmt, sourceText, template)
			}
			// Handle VariableStatement
			else if (ts.isVariableStatement(stmt)) {
				for (const decl of stmt.declarationList.declarations) {
					if (!ts.isIdentifier(decl.name))
						continue
					const name = decl.name.text
					const stmtIndent = getLineIndent(sourceText, stmt.getStart(sf))
					const init = decl.initializer

					let template: string
					if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
						const params = init.parameters.map(p => ({ name: p.name.getText() }))
						const typeParams = getTypeParamNames(init)
						let nonVoidReturn = true
						const sym = checker.getSymbolAtLocation(decl.name)
						if (sym) {
							const type = checker.getTypeOfSymbolAtLocation(sym, decl)
							const sigs = checker.getSignaturesOfType(type, ts.SignatureKind.Call)
							if (sigs[0]) {
								const returnType = checker.getReturnTypeOfSignature(sigs[0])
								nonVoidReturn = !(returnType.getFlags() & ts.TypeFlags.Void)
							}
						}
						template = functionTemplate(name, params, typeParams, nonVoidReturn, isInternal, stmtIndent)
					}
					else {
						template = constTemplate(name, isInternal, stmtIndent)
					}

					addOrReplace(sf.fileName, stmt, sourceText, template)
					break // JSDoc is at statement level, one template per statement
				}
			}
			// Handle ClassDeclaration
			else if (ts.isClassDeclaration(stmt) && stmt.name) {
				const name = stmt.name.text
				const indent = getLineIndent(sourceText, stmt.getStart(sf))
				const typeParams = getTypeParamNames(stmt)
				const template = classTemplate(name, typeParams, isInternal, indent)
				addOrReplace(sf.fileName, stmt, sourceText, template)

				// Process class public members
				for (const member of stmt.members) {
					if (isPrivateOrProtected(member))
						continue

					// Property declarations
					if (ts.isPropertyDeclaration(member) && member.name) {
						const memberName = member.name.getText()
						const isOptional = !!member.questionToken
						const memberIndent = getLineIndent(sourceText, member.getStart(sf))
						const memberTmpl = memberTemplate(memberName, isOptional, memberIndent)
						addOrReplace(sf.fileName, member, sourceText, memberTmpl)
					}
					// Method declarations
					else if (ts.isMethodDeclaration(member) && member.name) {
						const methodName = member.name.getText()
						const methodIndent = getLineIndent(sourceText, member.getStart(sf))
						const params = member.parameters.map(p => ({ name: p.name.getText() }))
						const methodTypeParams = member.typeParameters?.map(tp => tp.name.text) ?? []
						let nonVoidReturn = true
						const methodSym = member.name ? checker.getSymbolAtLocation(member.name) : undefined
						if (methodSym) {
							const type = checker.getTypeOfSymbolAtLocation(methodSym, member)
							const sigs = checker.getSignaturesOfType(type, ts.SignatureKind.Call)
							if (sigs[0]) {
								const returnType = checker.getReturnTypeOfSignature(sigs[0])
								nonVoidReturn = !(returnType.getFlags() & ts.TypeFlags.Void)
							}
						}
						const methodTmpl = functionTemplate(methodName, params, methodTypeParams, nonVoidReturn, false, methodIndent)
						addOrReplace(sf.fileName, member, sourceText, methodTmpl)
					}
					// Constructor
					else if (ts.isConstructorDeclaration(member)) {
						const ctorIndent = getLineIndent(sourceText, member.getStart(sf))
						const params = member.parameters.map(p => ({ name: p.name.getText() }))
						const ctorTmpl = functionTemplate('constructor', params, [], false, false, ctorIndent)
						addOrReplace(sf.fileName, member, sourceText, ctorTmpl)
					}
				}
			}
		}
	}

	// ── Apply modifications ──

	let totalTodos = 0
	let filesModified = 0

	for (const [filePath, mods] of fileModifications) {
		// Sort by start position descending (apply from bottom to top)
		mods.sort((a, b) => b.start - a.start)

		// De-duplicate overlapping ranges — when sorted descending, skip mods
		// whose range overlaps with the previously kept one
		const deduped: Modification[] = []
		for (const mod of mods) {
			if (deduped.length > 0) {
				const prev = deduped[deduped.length - 1]
				// prev.start >= mod.start (sorted desc). If mod.end > prev.start, they overlap.
				if (mod.end > prev!.start)
					continue
			}
			deduped.push(mod)
		}

		let text = await readFile(filePath, 'utf8')
		let todoCount = 0

		for (const mod of deduped) {
			text = text.slice(0, mod.start) + mod.text + text.slice(mod.end)
			todoCount += (mod.text.match(/@todo FILL/g) || []).length
		}

		// Collapse 3+ consecutive newlines to 2
		text = text.replace(/\n{3,}/g, '\n\n')

		await writeFile(filePath, text, 'utf8')
		totalTodos += todoCount
		filesModified++

		const rel = filePath.startsWith(`${workspaceRoot}/`)
			? filePath.slice(workspaceRoot.length + 1)
			: filePath
		console.log(`  ${rel}: ${todoCount} @todo markers`)
	}

	return { filesModified, todosInserted: totalTodos }
}

// ── Main ──

export async function runScaffold(args = process.argv.slice(2)) {
	if (args.includes('--help')) {
		console.log([
			'Usage: pnpm maintain-jsdocs:scaffold --packages <name> ...',
			'',
			'Insert JSDoc templates with @todo FILL markers on all exported declarations.',
			'Replaces existing JSDoc with templates (aggressive strategy).',
			'Covers all source files in each package, including @internal exports.',
			'',
			'Options:',
			'  --packages <name> ...  Required: packages to scaffold (e.g. core integration)',
			'',
			'Examples:',
			'  pnpm maintain-jsdocs:scaffold --packages core',
			'  pnpm maintain-jsdocs:scaffold --packages core integration plugin-reset',
		].join('\n'))
		return
	}

	const requestedPackages = readMultiValueOption(args, '--packages')
		.map(normalizePackageScope)

	if (requestedPackages.length === 0) {
		console.error('Error: --packages is required. Specify at least one package.')
		process.exit(1)
	}

	const targetPackages = PACKAGES.filter(pkg => requestedPackages.includes(pkg.dir))

	if (targetPackages.length === 0) {
		console.error('No matching packages found for the requested scope.')
		process.exit(1)
	}

	console.log('Creating TypeScript program...')
	const program = createApiProgram()
	const checker = program.getTypeChecker()

	console.log('Scaffolding JSDoc templates...\n')

	let totalFiles = 0
	let totalTodos = 0

	for (const pkg of targetPackages) {
		console.log(`${pkg.name}:`)
		const result = await scaffoldPackage(pkg, program, checker)
		totalFiles += result.filesModified
		totalTodos += result.todosInserted
		if (result.filesModified === 0) {
			console.log('  (no exports to scaffold)')
		}
		console.log('')
	}

	console.log(`Done: ${totalTodos} @todo markers across ${totalFiles} files`)
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('/scaffold.ts'))
	runScaffold()
