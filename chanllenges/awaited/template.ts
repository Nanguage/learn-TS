type MyAwaited<T extends Promise<unknown>> =
  T extends Promise<infer R>
  ? R extends Promise<unknown>
    ? MyAwaited<R>
    : R
  : never
  

// Key point
// 1. infer: https://blog.logrocket.com/understanding-infer-typescript/
