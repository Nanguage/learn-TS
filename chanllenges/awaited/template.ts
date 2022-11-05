type MyAwaited<P extends Promise<any>> =
  P extends Promise<infer D> ? MyAwaited<D> : P

// Key point
// 1. infer: https://blog.logrocket.com/understanding-infer-typescript/
