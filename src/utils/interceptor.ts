import { Observable } from 'rxjs/Observable'

type Gate<T, U extends any[]> = (...args: U) => Observable<T>

export function wrap<T, U extends any[]>(
  gate: Gate<T, U>,
  _interceptor?: any
): (options?: {}) => (...args: U) => Observable<T> {
  return () => gate
}
