type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
    ? RecursivePartial<T[P]>
    : T[P]
}

export default function wrapProxy<T extends object>(
  target: T,
  fallbackProps: RecursivePartial<T>,
  functionCallback: (name: string, args: unknown[]) => void,
  setterCallback: (name: string, value: unknown) => void,
): T {
  const handler: ProxyHandler<T> = {
    get(t, p) {
      if (typeof p !== 'string') return undefined

      if (typeof target[p as keyof T] === 'function') {
        return function (...args: Parameters<T[keyof T]>) {
          console.log('calling', p, '(', ...args, ')')
          return functionCallback(p, args)
        }
      }
      const fallback = fallbackProps[p as keyof T]
      /*
      const realValue = target[p as keyof T]

      if (JSON.stringify(fallback) !== JSON.stringify(realValue))
        console.warn(
          `retrieving non-function prop ${p}, fallback ${
            p in fallbackProps ? 'has' : 'does not have'
          } value`,
          fallback,
          'actual value',
          realValue,
        )

 */
      return fallback
    },
    set(t, p, v) {
      if (typeof p === 'string') setterCallback(p, v)
      //      console.log('setting', p, '=', v)
      return true
    },
  }

  return new Proxy({}, handler) as T
}
