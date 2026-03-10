# Atomic Order And Cascade

Atomic CSS has a common footgun: the order of class tokens in markup is not what decides the final result.

The browser resolves conflicts by comparing the generated CSS declarations in the stylesheet. When two atomic declarations have the same specificity, the declaration that appears later in CSS wins.

## The common atomic ordering problem

You may have seen this in utility-first workflows such as UnoCSS or TailwindCSS.

<<< @/.examples/principles/order-class-order-problem.tsx

Both elements above can still point at the same shared global declarations:

<<< @/.examples/principles/order-class-order-problem.css

That means both elements use the same stylesheet order, regardless of the token order inside the `class` attribute.

If `.pl-2` is emitted after `.px-4`, both elements end with `padding-left: 0.5rem`.

If `.px-4` is emitted after `.pl-2`, both elements end with `padding-left: 1rem`.

The markup changed, but the cascade did not.

## Why this happens

Atomic systems try to reuse one declaration everywhere.

That reuse is good for output size, but it creates a real constraint: once a shared declaration already exists globally, a later component cannot rely on token order alone to change how that declaration participates in the cascade.

The problem becomes visible when declarations overlap in effect, for example:

- shorthand and longhand pairs such as `padding` and `padding-left`
- aggregate families such as `background-color` and `background`
- patched shorthand families such as `overflow-x` and `overflow`
- universal resets such as `all` combined with any later property

## What PikaCSS does differently

PikaCSS still deduplicates normal atomic declarations, but it treats overlap as a first-class problem.

When the engine sees a later declaration that can change the effective result of an earlier one inside the same selector scope, it marks that later declaration as order-sensitive instead of reusing a global cached class.

In practice, that means author order is preserved where it actually matters.

<<< @/.examples/principles/order-pika-overlap.ts

<<< @/.examples/principles/order-pika-overlap.css

In this example, `padding-left: 8px` appears twice on purpose.

The second `padding-left` is not reused from the first component, because reusing it would detach it from the `padding: 24px` declaration that comes right before it. PikaCSS keeps a fresh atomic class so the later overlap still wins in the correct local order.

## The key tradeoff

PikaCSS does not disable deduplication globally just to solve cascade issues.

Only later declarations that overlap in effect become order-sensitive. Unrelated declarations still reuse the same atomic class across the project.

That gives PikaCSS a more useful balance:

- predictable cascade for overlapping declarations
- normal atomic reuse for unrelated declarations
- no requirement to manually reason about global utility emission order

## What this means for real projects

You can write style definitions in the order that expresses intent and trust the engine to preserve that intent when property effects overlap.

You still need to think about normal CSS rules such as specificity, selector shape, and layers. PikaCSS is not bypassing the cascade. It is making atomic generation cooperate with it instead of accidentally fighting it.

## When this matters most

This behavior matters most when your project has:

- component variants that mix shorthand and longhand declarations
- plugin-generated declarations that expand into overlapping CSS families
- reset patterns using `all`
- teams that expect later author intent to stay local and predictable

## Next

- [How PikaCSS Works](/concepts/how-pikacss-works)
- [Build-time Engine](/concepts/build-time-engine)
- [Configuration](/guide/configuration)
- [Common Problems](/troubleshooting/common-problems)
