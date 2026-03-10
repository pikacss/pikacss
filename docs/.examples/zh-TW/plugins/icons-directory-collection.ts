// pika.config.ts
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { icons } from '@pikacss/plugin-icons'
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	plugins: [icons()],
	icons: {
		collections: {
			custom: FileSystemIconLoader('./src/assets/icons'),
		},
	},
})
// 用法：pika('i-custom:logo') -> ./src/assets/icons/logo.svg