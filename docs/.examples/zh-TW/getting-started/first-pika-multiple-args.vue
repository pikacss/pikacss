<template>
	<!-- pika() 可以接收多個參數（StyleItem[]） -->
	<!-- 每個參數都可以是字串（shortcut）或樣式物件 -->
	<div
		:class="pika(
			'my-shortcut',
			{
				fontSize: '1.5rem',
				color: '#333',
			},
		)"
	>
		Combining shortcuts and inline styles
	</div>
</template>
