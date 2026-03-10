import type { CSSProperties } from 'react'

type ProgressBarProps = {
	value: number
	color: string
}

const progressBar = pika({
	width: 'var(--progress-width)',
	backgroundColor: 'var(--progress-color)',
})

function ProgressBar({ value, color }: ProgressBarProps) {
	return (
		<div
			className={progressBar}
			style={{
				'--progress-width': `${value}%`,
				'--progress-color': color,
			} as CSSProperties}
		/>
	)
}