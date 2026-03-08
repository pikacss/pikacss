type TupleFormDynamic = [
	selector: RegExp,
	value: (matched: RegExpMatchArray) => Awaitable<Arrayable<string>>,
	autocomplete?: string | string[],
]