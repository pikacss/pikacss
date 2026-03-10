import type { CSSProperties } from 'react'

type BadgeVariant = 'solid' | 'outline'

const badgeClassNames = {
	solid: pika({
		backgroundColor: 'var(--badge-color)',
		color: 'white',
	}),
	outline: pika({
		border: '1px solid var(--badge-color)',
		color: 'var(--badge-color)',
	}),
} satisfies Record<BadgeVariant, string>

type BadgeProps = {
	variant: BadgeVariant
	color: string
}

function Badge({ variant, color }: BadgeProps) {
	return (
		<span
			className={badgeClassNames[variant]}
			style={{ '--badge-color': color } as CSSProperties}
		/>
	)
}