const buttonVariants = {
	primary: pika({
		backgroundColor: '#3b82f6',
		color: 'white',
	}),
	danger: pika({
		backgroundColor: '#ef4444',
		color: 'white',
	}),
}

// 在執行階段選擇 variant 只是單純的物件存取：
// 上面每一次 pika() 呼叫在建置時期就已經編譯完成。
export function buttonClass(kind: keyof typeof buttonVariants) {
	return buttonVariants[kind]
}
