import { defineStyleDefinition, defineVariables } from '@pikacss/core'

export const typographyVariables = defineVariables({
	'--pk-prose-body': 'currentColor',
	'--pk-prose-headings': 'currentColor',
	'--pk-prose-links': 'currentColor',
	'--pk-prose-lists': 'currentColor',
	'--pk-prose-hr': 'currentColor',
	'--pk-prose-captions': 'currentColor',
	'--pk-prose-code': 'currentColor',
	'--pk-prose-pre-code': 'currentColor',
	'--pk-prose-pre-bg': 'transparent',
	'--pk-prose-quotes': 'currentColor',
	'--pk-prose-bold': 'inherit',
	'--pk-prose-counters': 'currentColor',
	'--pk-prose-bullets': 'currentColor',
	'--pk-prose-th-borders': 'currentColor',
	'--pk-prose-td-borders': 'currentColor',
})

export const proseBaseStyle = defineStyleDefinition({
	'color': 'var(--pk-prose-body)',
	'maxWidth': '65ch',
	'fontSize': '1rem',
	'lineHeight': '1.75',
	'$ p': {
		marginTop: '1.25em',
		marginBottom: '1.25em',
	},
	'$ [class~="lead"]': {
		fontSize: '1.25em',
		lineHeight: '1.6',
		marginTop: '1.2em',
		marginBottom: '1.2em',
	},
	'$ a': {
		color: 'var(--pk-prose-links)',
		textDecoration: 'underline',
		fontWeight: '500',
	},
	'$ strong': {
		color: 'var(--pk-prose-bold)',
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
	'$ ol': {
		listStyleType: 'decimal',
		marginTop: '1.25em',
		marginBottom: '1.25em',
		paddingLeft: '1.625em',
	},
	'$ ul': {
		listStyleType: 'disc',
		marginTop: '1.25em',
		marginBottom: '1.25em',
		paddingLeft: '1.625em',
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
	'$ hr': {
		borderColor: 'var(--pk-prose-hr)',
		borderTopWidth: '1px',
		marginTop: '3em',
		marginBottom: '3em',
	},
	'$ blockquote': {
		fontWeight: '500',
		fontStyle: 'italic',
		color: 'var(--pk-prose-quotes)',
		borderLeftWidth: '0.25rem',
		borderLeftColor: 'var(--pk-prose-quotes)',
		marginTop: '1.6em',
		marginBottom: '1.6em',
		paddingLeft: '1em',
	},
	'$ h1': {
		color: 'var(--pk-prose-headings)',
		fontWeight: '800',
		fontSize: '2.25em',
		marginTop: '0',
		marginBottom: '0.88em',
		lineHeight: '1.1',
	},
	'$ h2': {
		color: 'var(--pk-prose-headings)',
		fontWeight: '700',
		fontSize: '1.5em',
		marginTop: '2em',
		marginBottom: '1em',
		lineHeight: '1.33',
	},
	'$ h3': {
		color: 'var(--pk-prose-headings)',
		fontWeight: '600',
		fontSize: '1.25em',
		marginTop: '1.6em',
		marginBottom: '0.6em',
		lineHeight: '1.6',
	},
	'$ h4': {
		color: 'var(--pk-prose-headings)',
		fontWeight: '600',
		marginTop: '1.5em',
		marginBottom: '0.5em',
		lineHeight: '1.5',
	},
	'$ img': {
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
		color: 'var(--pk-prose-captions)',
		fontSize: '0.875em',
		lineHeight: '1.4',
		marginTop: '0.85em',
	},
	'$ code': {
		color: 'var(--pk-prose-code)',
		fontWeight: '600',
		fontSize: '0.875em',
	},
	'$ code::before': {
		content: '"`"',
	},
	'$ code::after': {
		content: '"`"',
	},
	'$ a code': {
		color: 'inherit',
	},
	'$ pre': {
		color: 'var(--pk-prose-pre-code)',
		backgroundColor: 'var(--pk-prose-pre-bg)',
		overflowX: 'auto',
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
		borderBottomColor: 'var(--pk-prose-th-borders)',
	},
	'$ thead th': {
		color: 'var(--pk-prose-headings)',
		fontWeight: '600',
		verticalAlign: 'bottom',
		paddingRight: '0.57em',
		paddingBottom: '0.57em',
		paddingLeft: '0.57em',
	},
	'$ tbody tr': {
		borderBottomWidth: '1px',
		borderBottomColor: 'var(--pk-prose-td-borders)',
	},
	'$ tbody tr:last-child': {
		borderBottomWidth: '0',
	},
	'$ tbody td': {
		verticalAlign: 'baseline',
		paddingTop: '0.57em',
		paddingRight: '0.57em',
		paddingBottom: '0.57em',
		paddingLeft: '0.57em',
	},
})
