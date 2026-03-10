# Icons

`@pikacss/plugin-icons` is the fastest way to pull large icon sets into the same build-time styling workflow as the rest of your PikaCSS system.

## When to use it

Use the icons plugin when you want:

- icon names to behave like style-item strings
- zero runtime icon component overhead
- Iconify collection coverage
- CSS output that can still be themed through your existing styling model

## Install

::: code-group
<<< @/.examples/plugins/icons-install.sh [pnpm]
<<< @/.examples/plugins/icons-install-npm.sh [npm]
<<< @/.examples/plugins/icons-install-yarn.sh [yarn]
:::

## Minimal setup

<<< @/.examples/plugins/icons-basic-config.ts

## Usage

<<< @/.examples/plugins/icons-usage.ts

<<< @/.examples/plugins/icons-usage.vue

## Naming model

The default naming pattern uses the `i-` prefix plus `collection:name`, for example `i-mdi:home`.

This is valuable because icons become part of the same static authoring surface as shortcuts and selectors. Teams can review them as plain source strings instead of a separate runtime component system.

## Do and do not

| Do | Do not |
| --- | --- |
| Install the icon collections you actually use. | Assume every remote icon will always resolve in CI without configuration. |
| Keep icon naming conventions consistent across the project. | Mix several prefixes and ad hoc conventions without reason. |
| Use autocomplete for common icons. | Expect humans to remember hundreds of icon names accurately. |

## Advanced customization

<<< @/.examples/plugins/icons-advanced-config.ts

<<< @/.examples/plugins/icons-custom-collections.ts

If you want to keep your own SVG files in the repository, you can point a custom collection at a directory and keep using the same `i-collection:name` naming model.

This uses Iconify's filesystem loader, so it should be configured in a Node-based build environment such as Vite, Nuxt, or the PikaCSS CLI.

<<< @/.examples/plugins/icons-directory-collection.ts

## Next

- [Reset](/plugins/reset)
- [Typography](/plugins/typography)
- [Create A Plugin](/plugin-system/create-plugin)
- [Configuration](/guide/configuration)
