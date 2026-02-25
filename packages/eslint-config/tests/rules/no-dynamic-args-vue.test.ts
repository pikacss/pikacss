import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import * as vueParser from 'vue-eslint-parser'
import rule from '../../src/rules/no-dynamic-args'

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		parser: vueParser,
	},
})

describe('no-dynamic-args (vue sfc)', () => {
	it('should validate static vs dynamic arguments in pika() calls inside <template>', () => {
		ruleTester.run('no-dynamic-args', rule, {
			valid: [
				// Static pika() in template expression
				{
					filename: 'test.vue',
					code: `
<template>
  <div :class="pika({ color: 'red' })">hello</div>
</template>
<script setup>
import { pika } from 'pikacss'
</script>`,
				},

				// Static pika.str() in template
				{
					filename: 'test.vue',
					code: `
<template>
  <div :class="pika.str({ color: 'red' })">hello</div>
</template>
<script setup>
import { pika } from 'pikacss'
</script>`,
				},

				// Static pika() in mustache interpolation
				{
					filename: 'test.vue',
					code: `
<template>
  <div>{{ pika({ color: 'red' }) }}</div>
</template>
<script setup>
import { pika } from 'pikacss'
</script>`,
				},

				// Static pika() in script setup (should still work)
				{
					filename: 'test.vue',
					code: `
<template>
  <div>hello</div>
</template>
<script setup>
import { pika } from 'pikacss'
const cls = pika({ color: 'red' })
</script>`,
				},

				// Non-pika function in template — should be ignored
				{
					filename: 'test.vue',
					code: `
<template>
  <div :class="someOtherFn(dynamicVar)">hello</div>
</template>
<script setup>
</script>`,
				},
			],

			invalid: [
				// Dynamic variable in pika() inside template binding
				{
					filename: 'test.vue',
					code: `
<template>
  <div :class="pika({ color: someVar })">hello</div>
</template>
<script setup>
import { pika } from 'pikacss'
const someVar = 'red'
</script>`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// Dynamic pika() in mustache interpolation
				{
					filename: 'test.vue',
					code: `
<template>
  <div>{{ pika({ color: someVar }) }}</div>
</template>
<script setup>
import { pika } from 'pikacss'
const someVar = 'red'
</script>`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// Variable as argument in template
				{
					filename: 'test.vue',
					code: `
<template>
  <div :class="pika(styles)">hello</div>
</template>
<script setup>
import { pika } from 'pikacss'
const styles = { color: 'red' }
</script>`,
					errors: [{ messageId: 'noDynamicArg' }],
				},

				// Dynamic pika.str() in template
				{
					filename: 'test.vue',
					code: `
<template>
  <div :class="pika.str({ color: someVar })">hello</div>
</template>
<script setup>
import { pika } from 'pikacss'
const someVar = 'red'
</script>`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// Dynamic pika() in script setup (should still report)
				{
					filename: 'test.vue',
					code: `
<template>
  <div>hello</div>
</template>
<script setup>
import { pika } from 'pikacss'
const cls = pika({ color: someVar })
</script>`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},

				// Function call in template pika()
				{
					filename: 'test.vue',
					code: `
<template>
  <div :class="pika({ color: getColor() })">hello</div>
</template>
<script setup>
import { pika } from 'pikacss'
</script>`,
					errors: [{ messageId: 'noDynamicProperty' }],
				},
			],
		})
	})
})
