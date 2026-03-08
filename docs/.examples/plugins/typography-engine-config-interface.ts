interface EngineConfig {
	typography?: TypographyPluginOptions
}

interface TypographyPluginOptions {
	variables?: Partial<typeof typographyVariables>
}