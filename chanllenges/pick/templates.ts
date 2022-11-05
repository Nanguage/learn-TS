type MyPick<T, K extends keyof T> = {
  [k in K]: T[k]
}

// Key points
// 1. extends: 
// 2. keyof: https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
// 3. Mapped types: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html