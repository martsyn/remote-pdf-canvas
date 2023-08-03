type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
    ? RecursivePartial<T[P]>
    : T[P]
}

export default function wrapProxy<T extends object>(target: T, fallback: RecursivePartial<T>): T {
  const handler: ProxyHandler<T> = {
    get(t, p) {
      if (typeof target[p as keyof T] === 'function') {
        return function (...args: Parameters<T[keyof T]>) {
          console.log('calling', p, '(', ...args, ')')
          return target[p as keyof T](...args)
        }
      }
      console.warn('retrieving non-function prop', p)
      return fallback[p as keyof T] // target[prop as keyof T]
    },
    set(t, p, v) {
      console.log('setting', p, '=', v)
      target[p as keyof T] = v
      return true
    },
  }

  return new Proxy({}, handler) as T
}
