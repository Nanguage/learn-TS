type myType = string | undefined | null

type tp2<T> = T extends undefined | null ? never : T
type tp3 = tp2<myType>

type tp4 = Extract<myType, undefined|null>