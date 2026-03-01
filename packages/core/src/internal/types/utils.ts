export type Nullish = null | undefined

export type UnionString = string & {}

export type Arrayable<T> = T | T[]

export type Awaitable<T> = T | Promise<T>

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

export type IsNever<T> = [T] extends [never] ? true : false

export type Simplify<T> = { [K in keyof T]: T[K] } & {}

export type ToKebab<T extends string> = T extends `${infer A}${infer U}${infer Rest}`
	? U extends Uppercase<U>
		? U extends Lowercase<U>
			? `${Lowercase<A>}${ToKebab<`${U}${Rest}`>}`
			: `${Lowercase<A>}-${ToKebab<`${Lowercase<U>}${Rest}`>}`
		: `${Lowercase<A>}${ToKebab<`${U}${Rest}`>}`
	: Lowercase<T>

export type FromKebab<T extends string> = T extends `--${string}`
	? T
	: T extends `${infer Head}-${infer Tail}`
		? `${Head}${FromKebab<Capitalize<Tail>>}`
		: T

export type GetValue<
	Obj,
	K extends string,
> = [Obj] extends [never]
	? never
	: K extends keyof Obj
		? Obj[K]
		: never

export type ResolveFrom<T, Key extends string, I, Fallback extends I> = Key extends keyof T
	? T[Key] extends I
		? T[Key]
		: Fallback
	: Fallback
