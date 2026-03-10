<template>
	<div>
		<!-- 基本圖示 -->
		<span :class="pika('i-mdi:home')" />

		<!-- 強制使用 mask 模式：圖示顏色會跟隨文字顏色 -->
		<span
			:class="pika('i-mdi:account?mask')"
			style="color: red;"
		/>

		<!-- 強制使用 bg 模式：圖示會保留原本的 SVG 顏色 -->
		<span :class="pika('i-mdi:palette?bg')" />
	</div>
</template>
