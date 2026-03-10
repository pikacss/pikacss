type ProgressBarProps = {
	value: number
	color: string
}

function ProgressBar({ value, color }: ProgressBarProps) {
	return (
		<div
			className={pika({
				width: `${value}%`,
				backgroundColor: color,
			})}
		/>
	)
}