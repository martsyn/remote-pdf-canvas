export default function wrapProxy<T extends object>(target: T): T {
  const handler: ProxyHandler<T> = {
    isExtensible(target) {
      console.log('isExtensible called')
      return Reflect.isExtensible(target)
    },
    get(target, prop) {
      if (typeof target[prop as keyof T] === 'function') {
        return function (...args) {
          console.log('calling', prop, '(', ...args, ')')
          return target[prop as keyof T](...args)
        }
      }
      console.warn('retrieving non-function prop', prop)
      return target[prop as keyof T]
    },
    set(o, p, v) {
      console.log('setting', p, '=', v)
      o[p as keyof T] = v
      return true
    },
  }

  return new Proxy(target, handler) as T
}
