import { Observable } from 'rxjs/Observable'

type Gate<T, U extends any[]> = (...args: U) => Observable<T>

export function wrap<T, U extends any[]>(
  gate: Gate<T, U>,
  interceptor: any = (_0: any, g: Gate<T, U>, args: U) => g(...args)
): (options?: {}) => (...args: U) => Observable<T> {
  return (options: {} = {}) => (...args: U) => interceptor(options, gate, args)
}
