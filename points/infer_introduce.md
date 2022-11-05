# 关于 infer 关键字

来源： https://blog.logrocket.com/understanding-infer-typescript/

## 一个问题

```Typescript
function describePerson(person: {
  name: string;
  age: number;
  hobbies: [string, string]; // tuple
}) {
  return `${person.name} is ${person.age} years old and love ${person.hobbies.join(" and  ")}.`;
}

const alex = {
  name: 'Alex',
  age: 20,
  hobbies: ['walking', 'cooking'] // type string[] != [string, string]
}

describePerson(alex) /* Type string[] is not assignable to type [string, string] */
```

在上述代码中，TypeScript 的类型系统会报错，我们希望通过引入一个 Generic 来避免这个错误：

```TypeScript
const alex: GetFirstArgumentOfAnyFunction<typeof describePerson> = {
  name: "Alex",
  age: 20,
  hobbies: ["walking", "cooking"],
};

describePerson(alex); /* No TypeScript errors */ 

```

在实现这个 Generic 的过程中，我们需要了解关于 `infer` 的一些知识。

## never

`never` 可以理解为表示空集合， 比如 `string | never` 等价于 `string`，表示所有字符串的集合。

## extends

`T extends K` 意味着：一个 `T` 类型的值也一定是 `K` 类型。如果以集合论来理解，就是说 T 是 K 的子集。
同时，`extends` 还具有判断的语义，因此可以使用 `extends` 构造三元表达式：

```Typescript
type StringFromType<T> = T extends string ? 'string' : never

type lorem = StringFromType<'lorem ipsum'>  // 'string'
type ten = StringFromType<10> // never
```

可以串联更多的条件：

```Typescript
type StringFromType<T> = T extends string
    ? 'string'
    : T extends boolean
    ? 'boolean'
    : T extends Error
    ? 'error'
    : never

type lorem = StringFromType<'lorem ipsum'>  // 'string'
type isActive = StringFromType<false> // 'boolean'
type unassignable = StringFromType<TypeError> // 'error
```

## Conditional types 和 Union

当一个 `union` 类型 `extends` 一个类型约束时，TypeScript 将会遍历这个 `union` 的每个成员。

```Typescript
type NullableString = string | null | undefined
type NonNullable<T> = T extends null | undefined ? never : T
type CondUnionType = NonNullable<NullableString> // evalutes to string
```

在上面的例子中，TS 会遍历我们的 `union` 中的成员，测试它是否满足约束。
你可以认为它具有类似如下代码的行为：

```Typescript
type stringLoop = string extends null | undefined ? never : string // string
type nullLoop = null extends null | undefined ? never : null // never
type undefinedLoop = undefined extends null | undefined ? never : undefined // never
type ReturnUnion = stringLoop | nullLoop | undefinedLoop // string
```

根据这个原理，我们可以抽象出如下两个 `TypeScript` 中的 built-in generic：

```Typescript
type Extract<T, U> = T extends U ? T : never
type Exclude<T, U> = T extends U ? never : T
```

## Condition types 与 函数

为了检查一个类型是否符合一个函数的约束，必须使用 `Function` 类型。
如下的函数签名可以 `extends` 所有的函数：

```TypeScript
type AllFunctions = (...args: any[]) => any
```

`...args: any[]` 能够覆盖 0 到任意多个任意类型的参数，`any` 可以覆盖所有的返回值类型。

## 使用 infer 关键字

`infer` 关键字允许我们在一个约束中定义一个待引用或者返回的变量。它不能定义在 `extends` 语句之外。

TypeScript 内置的 `ReturnType` 可以让我们拿到一个函数类型的返回值类型。

```TypeScript
type a = ReturnType<() => void> // void
type b = ReturnType<() => string | number> // string | number
type c = ReturnType<() => any> // any
```

他的源代码：

```TypeScript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```
它首先对 `T` 进行检查，看是否是函数，并且在检查的过程中，将返回值放进一个变量 `infer R`，
如果检查成功将返回 `R` 否则返回 `any`。 

`infer` 主要的用途就是访问一个我们本来无法访问到的变量。

## React 的 prop 类型

在 React 中，我们经常需要访问 prop 类型。
为了达到这个目的，React 为我们提供了一个类型 `ComponentProps`，他的实现中就使用了 `infer` 关键字。

```TypeScript
type ComponentProps<
    T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
> = T extends JSXElementConstructor<infer P>
    ? P
    : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : {}
```

在检查确定我们的类型是一个 React component 之后，它会 `infer` 它的 `props` 并返回。
如果失败，就会检查类型参数是否为 `IntrinsicElements`（比如 `div`, `button` 等），
并返回他的 `props`。如果所有都失败将会返回 `{}`，在 TS 中它代表任何不是`null`的值。


## 解决我们的问题

现在我们就可以定义一个获取函数首个参数类型的 Generic 来解决我们的问题了：

```TypeScript
type GetFirstArgumentOfAnyFunction<T> = T extends (
    first: infer FirstArgument,
    ...args: any[]
) => any
    ? FirstArgument
    : never

type t = GetFirstArgumentOfAnyFunction<(name: string, age: number) => void> // string
```

举一反三，获取第二个参数：

```TypeScript
type GetSecondArgumentOfAnyFunction<T> = T extends (
    first: any,
    second: SecondArgument
    ...args: any[]
) => any
    ? SecondArgument
    : never

type t = GetSecondArgumentOfAnyFunction<(name: string, age: number) => void> // number
```

获取 Promise 的返回类型：

```TypeScript
type PromiseReturnType<T> = T extends Promise<infer K> ? K : T
type t = PromiseReturnType<Promise<string>> // string
```

Array type:

```TypeScript
type ArrayType<T> = T extends Array<infer K> ? K : T
type t = ArrayType<Array<string>> // string
```
