import type { StyleDefinition, VariablesDefinition } from '@pikacss/core'
import { defineStyleDefinition } from '@pikacss/core'

export const typographyVariables = {
	'--pk-prose-color-body': 'currentColor',
	'--pk-prose-color-headings': 'currentColor',
	'--pk-prose-color-lead': 'currentColor',
	'--pk-prose-color-links': 'currentColor',
	'--pk-prose-color-bold': 'currentColor',
	'--pk-prose-color-counters': 'currentColor',
	'--pk-prose-color-bullets': 'currentColor',
	'--pk-prose-color-hr': 'currentColor',
	'--pk-prose-color-quotes': 'currentColor',
	'--pk-prose-color-quote-borders': 'currentColor',
	'--pk-prose-color-captions': 'currentColor',
	'--pk-prose-color-code': 'currentColor',
	'--pk-prose-color-pre-code': 'currentColor',
	'--pk-prose-color-pre-bg': 'transparent',
	'--pk-prose-color-th-borders': 'currentColor',
	'--pk-prose-color-td-borders': 'currentColor',
	'--pk-prose-color-kbd': 'currentColor',
	'--pk-prose-kbd-shadows': 'currentColor',
} satisfies VariablesDefinition

// Base prose styles
export const proseBaseStyle: StyleDefinition = defineStyleDefinition({
	'color': 'var(--pk-prose-color-body)',
	'maxWidth': '65ch',
	'fontSize': '1rem',
	'lineHeight': '1.75',
	'$ > :first-child': {
		marginTop: '0',
	},
	'$ > :last-child': {
		marginBottom: '0',
	},
})

// Paragraph styles
export const proseParagraphsStyle: StyleDefinition = defineStyleDefinition({
	'$ p': {
		marginTop: '1.25em',
		marginBottom: '1.25em',
	},
	'$ [class~="lead"]': {
		color: 'var(--pk-prose-color-lead)',
		fontSize: '1.25em',
		lineHeight: '1.6',
		marginTop: '1.2em',
		marginBottom: '1.2em',
	},
})

// Link styles
export const proseLinksStyle: StyleDefinition = defineStyleDefinition({
	'$ a': {
		color: 'var(--pk-prose-color-links)',
		textDecoration: 'underline',
		fontWeight: '500',
	},
	'$ a strong': {
		color: 'inherit',
	},
	'$ a code': {
		color: 'inherit',
	},
})

// Emphasis styles (strong, em)
export const proseEmphasisStyle: StyleDefinition = defineStyleDefinition({
	'$ strong': {
		color: 'var(--pk-prose-color-bold)',
		fontWeight: '600',
	},
	'$ a strong': {
		color: 'inherit',
	},
	'$ blockquote strong': {
		color: 'inherit',
	},
	'$ thead th strong': {
		color: 'inherit',
	},
	'$ em': {
		fontStyle: 'italic',
	},
})

// Keyboard styles
export const proseKbdStyle: StyleDefinition = defineStyleDefinition({
	'$ kbd': {
		color: 'var(--pk-prose-color-kbd)',
		fontSize: '0.875em',
		fontWeight: '500',
		fontFamily: 'inherit',
		borderRadius: '0.3125rem',
		paddingTop: '0.1875em',
		paddingRight: '0.375em',
		paddingBottom: '0.1875em',
		paddingLeft: '0.375em',
		boxShadow: '0 0 0 1px var(--pk-prose-kbd-shadows), 0 3px 0 var(--pk-prose-kbd-shadows)',
	},
})

// Lists styles
export const proseListsStyle: StyleDefinition = defineStyleDefinition({
	'$ ol': {
		listStyleType: 'decimal',
		marginTop: '1.25em',
		marginBottom: '1.25em',
		paddingLeft: '1.625em',
	},
	'$ ol[type="A"]': {
		listStyleType: 'upper-alpha',
	},
	'$ ol[type="a"]': {
		listStyleType: 'lower-alpha',
	},
	'$ ol[type="A" s]': {
		listStyleType: 'upper-alpha',
	},
	'$ ol[type="a" s]': {
		listStyleType: 'lower-alpha',
	},
	'$ ol[type="I"]': {
		listStyleType: 'upper-roman',
	},
	'$ ol[type="i"]': {
		listStyleType: 'lower-roman',
	},
	'$ ol[type="I" s]': {
		listStyleType: 'upper-roman',
	},
	'$ ol[type="i" s]': {
		listStyleType: 'lower-roman',
	},
	'$ ol[type="1"]': {
		listStyleType: 'decimal',
	},
	'$ ul': {
		listStyleType: 'disc',
		marginTop: '1.25em',
		marginBottom: '1.25em',
		paddingLeft: '1.625em',
	},
	'$ ul ul': {
		listStyleType: 'circle',
	},
	'$ ul ul ul': {
		listStyleType: 'square',
	},
	'$ li': {
		marginTop: '0.5em',
		marginBottom: '0.5em',
	},
	'$ ol > li': {
		paddingLeft: '0.375em',
	},
	'$ ul > li': {
		paddingLeft: '0.375em',
	},
	'$ > ul > li p': {
		marginTop: '0.75em',
		marginBottom: '0.75em',
	},
	'$ > ul > li > :first-child': {
		marginTop: '1.25em',
	},
	'$ > ul > li > :last-child': {
		marginBottom: '1.25em',
	},
	'$ > ol > li > :first-child': {
		marginTop: '1.25em',
	},
	'$ > ol > li > :last-child': {
		marginBottom: '1.25em',
	},
	'$ ul ul, $ ul ol, $ ol ul, $ ol ol': {
		marginTop: '0.75em',
		marginBottom: '0.75em',
	},
	'$ dl': {
		marginTop: '1.25em',
		marginBottom: '1.25em',
	},
	'$ dt': {
		color: 'var(--pk-prose-color-headings)',
		fontWeight: '600',
		marginTop: '1.25em',
	},
	'$ dd': {
		marginTop: '0.5em',
		paddingLeft: '1.625em',
	},
})

// Horizontal rule styles
export const proseHrStyle: StyleDefinition = defineStyleDefinition({
	'$ hr': {
		borderColor: 'var(--pk-prose-color-hr)',
		borderTopWidth: '1px',
		marginTop: '3em',
		marginBottom: '3em',
	},
	'$ hr + *': {
		marginTop: '0',
	},
})

// Headings styles
export const proseHeadingsStyle: StyleDefinition = defineStyleDefinition({
	'$ h1': {
		color: 'var(--pk-prose-color-headings)',
		fontWeight: '800',
		fontSize: '2.25em',
		marginTop: '0',
		marginBottom: '0.88em',
		lineHeight: '1.1',
	},
	'$ h1 strong': {
		fontWeight: '900',
	},
	'$ h1 code': {
		color: 'inherit',
	},
	'$ h2': {
		color: 'var(--pk-prose-color-headings)',
		fontWeight: '700',
		fontSize: '1.5em',
		marginTop: '2em',
		marginBottom: '1em',
		lineHeight: '1.33',
	},
	'$ h2 strong': {
		fontWeight: '800',
	},
	'$ h2 code': {
		color: 'inherit',
	},
	'$ h2 + *': {
		marginTop: '0',
	},
	'$ h3': {
		color: 'var(--pk-prose-color-headings)',
		fontWeight: '600',
		fontSize: '1.25em',
		marginTop: '1.6em',
		marginBottom: '0.6em',
		lineHeight: '1.6',
	},
	'$ h3 strong': {
		fontWeight: '700',
	},
	'$ h3 code': {
		color: 'inherit',
	},
	'$ h3 + *': {
		marginTop: '0',
	},
	'$ h4': {
		color: 'var(--pk-prose-color-headings)',
		fontWeight: '600',
		marginTop: '1.5em',
		marginBottom: '0.5em',
		lineHeight: '1.5',
	},
	'$ h4 strong': {
		fontWeight: '700',
	},
	'$ h4 code': {
		color: 'inherit',
	},
	'$ h4 + *': {
		marginTop: '0',
	},
})

// Blockquote styles
export const proseQuotesStyle: StyleDefinition = defineStyleDefinition({
	'$ blockquote': {
		fontWeight: '500',
		fontStyle: 'italic',
		color: 'var(--pk-prose-color-quotes)',
		borderLeftWidth: '0.25rem',
		borderLeftColor: 'var(--pk-prose-color-quote-borders)',
		quotes: '"\\201C""\\201D""\\2018""\\2019"',
		marginTop: '1.6em',
		marginBottom: '1.6em',
		paddingLeft: '1em',
	},
	'$ blockquote p:first-of-type::before': {
		content: 'open-quote',
	},
	'$ blockquote p:last-of-type::after': {
		content: 'close-quote',
	},
	'$ blockquote code': {
		color: 'inherit',
	},
})

// Media styles (images, video, figure)
export const proseMediaStyle: StyleDefinition = defineStyleDefinition({
	'$ img': {
		marginTop: '2em',
		marginBottom: '2em',
	},
	'$ picture': {
		display: 'block',
		marginTop: '2em',
		marginBottom: '2em',
	},
	'$ video': {
		marginTop: '2em',
		marginBottom: '2em',
	},
	'$ figure': {
		marginTop: '2em',
		marginBottom: '2em',
	},
	'$ figure > *': {
		marginTop: '0',
		marginBottom: '0',
	},
	'$ figcaption': {
		color: 'var(--pk-prose-color-captions)',
		fontSize: '0.875em',
		lineHeight: '1.4',
		marginTop: '0.85em',
	},
})

// Code styles
export const proseCodeStyle: StyleDefinition = defineStyleDefinition({
	'$ code': {
		color: 'var(--pk-prose-color-code)',
		fontWeight: '600',
		fontSize: '0.875em',
	},
	'$ code::before': {
		content: '"`"',
	},
	'$ code::after': {
		content: '"`"',
	},
	'$ pre': {
		color: 'var(--pk-prose-color-pre-code)',
		backgroundColor: 'var(--pk-prose-color-pre-bg)',
		overflowX: 'auto',
		fontWeight: '400',
		fontSize: '0.875em',
		lineHeight: '1.7',
		marginTop: '1.7em',
		marginBottom: '1.7em',
		borderRadius: '0.375rem',
		paddingTop: '0.85em',
		paddingRight: '1.14em',
		paddingBottom: '0.85em',
		paddingLeft: '1.14em',
	},
	'$ pre code': {
		backgroundColor: 'transparent',
		borderWidth: '0',
		borderRadius: '0',
		padding: '0',
		fontWeight: 'inherit',
		color: 'inherit',
		fontSize: 'inherit',
		fontFamily: 'inherit',
		lineHeight: 'inherit',
	},
	'$ pre code::before': {
		content: 'none',
	},
	'$ pre code::after': {
		content: 'none',
	},
})

// Table styles
export const proseTablesStyle: StyleDefinition = defineStyleDefinition({
	'$ table': {
		width: '100%',
		tableLayout: 'auto',
		textAlign: 'left',
		marginTop: '2em',
		marginBottom: '2em',
		fontSize: '0.875em',
		lineHeight: '1.7',
	},
	'$ thead': {
		borderBottomWidth: '1px',
		borderBottomColor: 'var(--pk-prose-color-th-borders)',
	},
	'$ thead th': {
		color: 'var(--pk-prose-color-headings)',
		fontWeight: '600',
		verticalAlign: 'bottom',
		paddingRight: '0.57em',
		paddingBottom: '0.57em',
		paddingLeft: '0.57em',
	},
	'$ thead th:first-child': {
		paddingLeft: '0',
	},
	'$ thead th:last-child': {
		paddingRight: '0',
	},
	'$ thead th code': {
		color: 'inherit',
	},
	'$ tbody tr': {
		borderBottomWidth: '1px',
		borderBottomColor: 'var(--pk-prose-color-td-borders)',
	},
	'$ tbody tr:last-child': {
		borderBottomWidth: '0',
	},
	'$ tbody td': {
		verticalAlign: 'baseline',
	},
	'$ tbody td, $ tfoot td': {
		paddingTop: '0.57em',
		paddingRight: '0.57em',
		paddingBottom: '0.57em',
		paddingLeft: '0.57em',
	},
	'$ tbody td:first-child, $ tfoot td:first-child': {
		paddingLeft: '0',
	},
	'$ tbody td:last-child, $ tfoot td:last-child': {
		paddingRight: '0',
	},
})
