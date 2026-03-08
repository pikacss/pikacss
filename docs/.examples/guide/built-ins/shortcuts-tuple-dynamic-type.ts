type TupleFormDynamic = [
	shortcut: RegExp,
	value: (matched: RegExpMatchArray) => Awaitable<Arrayable<ResolvedStyleItem>>,
	autocomplete?: Arrayable<string>,
]