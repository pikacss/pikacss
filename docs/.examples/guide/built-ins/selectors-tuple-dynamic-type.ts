type TupleFormDynamic = [
	selector: RegExp,
	value: (matched: RegExpMatchArray) => string | string[],
	autocomplete?: string | string[],
]