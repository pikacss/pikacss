import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'
import { globby } from 'globby'
import matter from 'gray-matter'
import { resolve } from 'pathe'
import {
	anchorSequence,
	checkAllFixtures,
	docsRoot,
	extractHeadings,
	forbiddenTermsPath,
	zhLocaleDir,
} from './shared'

// ---------------------------------------------------------------------------
// Forbidden-terms source of truth
// ---------------------------------------------------------------------------

interface ForbiddenTerms {
	error: string[]
	warn: string[]
	simplifiedChars: string[]
}

function loadForbiddenTerms(): ForbiddenTerms {
	const raw = JSON.parse(readFileSync(forbiddenTermsPath, 'utf8')) as Partial<ForbiddenTerms>
	return {
		error: raw.error ?? [],
		warn: raw.warn ?? [],
		simplifiedChars: raw.simplifiedChars ?? [],
	}
}

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

type Severity = 'error' | 'warn'

interface Finding {
	file: string
	line: number
	severity: Severity
	message: string
}

// ---------------------------------------------------------------------------
// Comment extraction for fenced code blocks
// ---------------------------------------------------------------------------

interface CodeState {
	block: boolean
}

const RE_INLINE_CODE = /`[^`]*`/g
const RE_DISABLE = /<!--\s*i18n-lint-disable-next-line\s*(?:(\S+)\s*)?-->/

/** Extract the comment text from a single code line, honouring a spanning block-comment state. */
function extractCodeComment(line: string, st: CodeState): { comment: string, st: CodeState } {
	let out = ''
	let i = 0
	const n = line.length

	if (st.block) {
		const idx = line.indexOf('*/')
		if (idx === -1)
			return { comment: line, st: { block: true } }
		out += line.slice(0, idx)
		i = idx + 2
		st = { block: false }
	}

	// shell / yaml style whole-line comment
	if (!st.block && line.trim()
		.startsWith('#')) {
		return { comment: line, st }
	}

	let stringChar = ''
	for (; i < n; i++) {
		const c = line[i]!
		const nx = i + 1 < n ? line[i + 1]! : ''
		if (stringChar) {
			if (c === '\\') {
				i++
				continue
			}
			if (c === stringChar)
				stringChar = ''
			continue
		}
		if (c === '/' && nx === '/') {
			out += line.slice(i + 2)
			break
		}
		if (c === '/' && nx === '*') {
			const idx = line.indexOf('*/', i + 2)
			if (idx === -1) {
				out += line.slice(i + 2)
				return { comment: out, st: { block: true } }
			}
			out += line.slice(i + 2, idx)
			i = idx + 1
			continue
		}
		if (c === '\'' || c === '"' || c === '`')
			stringChar = c
	}
	return { comment: out, st }
}

// ---------------------------------------------------------------------------
// Term scanning
// ---------------------------------------------------------------------------

function scanText(text: string, terms: ForbiddenTerms, suppressed: Set<string>): { term: string, severity: Severity }[] {
	const hits: { term: string, severity: Severity }[] = []
	const suppressAll = suppressed.has('*')
	for (const term of terms.error) {
		if (text.includes(term) && !suppressAll && !suppressed.has(term))
			hits.push({ term, severity: 'error' })
	}
	for (const term of terms.warn) {
		if (text.includes(term) && !suppressAll && !suppressed.has(term))
			hits.push({ term, severity: 'warn' })
	}
	for (const ch of terms.simplifiedChars) {
		if (text.includes(ch) && !suppressAll && !suppressed.has(ch))
			hits.push({ term: ch, severity: 'error' })
	}
	return hits
}

function lintTerms(zhRel: string, content: string, terms: ForbiddenTerms): Finding[] {
	const findings: Finding[] = []
	const lines = content.split('\n')

	// Pass 1: collect per-line suppressions (disable comment applies to the NEXT line).
	const suppress = new Map<number, Set<string>>()
	lines.forEach((line, idx) => {
		const m = RE_DISABLE.exec(line)
		if (m) {
			const set = suppress.get(idx + 1) ?? new Set<string>()
			set.add(m[1] ?? '*')
			suppress.set(idx + 1, set)
		}
	})

	let inFence = false
	let codeState: CodeState = { block: false }
	lines.forEach((line, idx) => {
		const trimmed = line.trim()
		if (trimmed.startsWith('```')) {
			inFence = !inFence
			codeState = { block: false }
			return
		}
		const suppressed = suppress.get(idx) ?? new Set<string>()
		let scanTarget: string
		if (inFence) {
			const { comment, st } = extractCodeComment(line, codeState)
			codeState = st
			scanTarget = comment
		}
		else {
			// prose: drop inline code spans so identifiers are not flagged
			scanTarget = line.replace(RE_INLINE_CODE, ' ')
		}
		for (const hit of scanText(scanTarget, terms, suppressed)) {
			findings.push({
				file: `docs/${zhRel}`,
				line: idx + 1,
				severity: hit.severity,
				message: `${hit.severity === 'error' ? 'forbidden PRC term' : 'review PRC-ambiguous term'}: ${hit.term}`,
			})
		}
	})

	return findings
}

// ---------------------------------------------------------------------------
// Anchor conformity
// ---------------------------------------------------------------------------

function lintAnchors(zhRel: string, content: string): Finding[] {
	const englishRel = zhRel.replace(new RegExp(`^${zhLocaleDir}/`), '')
	const englishAbs = resolve(docsRoot, englishRel)
	if (!existsSync(englishAbs))
		return [] // orphaned; reported by status, not an anchor error

	const englishContent = readFileSync(englishAbs, 'utf8')
	const englishAnchors = anchorSequence(extractHeadings(englishContent))
	const zhHeadings = extractHeadings(content)

	const findings: Finding[] = []
	const missingId = zhHeadings.filter(h => !h.explicitId)
	if (missingId.length > 0) {
		findings.push({
			file: `docs/${zhRel}`,
			line: 1,
			severity: 'error',
			message: `every heading must carry an explicit English anchor {#id}; ${missingId.length} heading(s) missing one`,
		})
		return findings
	}

	const zhAnchors = zhHeadings.map(h => h.explicitId!)
	const equal = zhAnchors.length === englishAnchors.length
		&& zhAnchors.every((id, i) => id === englishAnchors[i])
	if (!equal) {
		findings.push({
			file: `docs/${zhRel}`,
			line: 1,
			severity: 'error',
			message: `anchor sequence does not match the English page\n      english: ${englishAnchors.join(', ')}\n      zh:      ${zhAnchors.join(', ')}`,
		})
	}
	return findings
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	const terms = loadForbiddenTerms()
	const zhPages = (await globby(`${zhLocaleDir}/**/*.md`, {
		cwd: docsRoot,
		ignore: [`${zhLocaleDir}/.examples/**`],
	})).sort()

	const findings: Finding[] = []

	for (const zhRel of zhPages) {
		const content = readFileSync(resolve(docsRoot, zhRel), 'utf8')
		const body = matter(content).content
		findings.push(...lintTerms(zhRel, body, terms))
		findings.push(...lintAnchors(zhRel, content))
		// frontmatter title/description are translated prose — scan them too
		const fm = matter(content).data as Record<string, unknown>
		const proseFm = [fm.title, fm.description].filter((v): v is string => typeof v === 'string')
			.join('\n')
		if (proseFm)
			findings.push(...lintTerms(zhRel, proseFm, terms))
	}

	// Fixture comment-only invariant
	const fixtureViolations = await checkAllFixtures()
	for (const v of fixtureViolations) {
		findings.push({
			file: v.zhFile,
			line: 1,
			severity: 'error',
			message: `fixture: ${v.reason} (source ${v.sourceFile})`,
		})
	}

	// Report
	const errors = findings.filter(f => f.severity === 'error')
	const warnings = findings.filter(f => f.severity === 'warn')

	console.log('\n=== zh-TW Translation Lint ===\n')
	console.log(`Scanned pages:  ${zhPages.length}`)
	console.log(`Errors:         ${errors.length}`)
	console.log(`Warnings:       ${warnings.length}`)
	console.log('')

	const printGroup = (label: string, group: Finding[]) => {
		if (group.length === 0)
			return
		console.log(`${label}:`)
		for (const f of group)
			console.log(`  ${f.file}:${f.line}  ${f.message}`)
		console.log('')
	}
	printGroup('Errors', errors)
	printGroup('Warnings (manual review)', warnings)

	if (errors.length === 0 && warnings.length === 0)
		console.log('Clean pass.')

	process.exit(errors.length > 0 ? 1 : 0)
}

main()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
