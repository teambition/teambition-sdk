'use strict'
import { Observer, Observable } from 'rxjs'

export function errorHandler<T>(observer: Observer<T>, err: Error): Observable<any> {
  observer.error(err)
  return Observable.of(null)
}

export function makeColdSignal <T> (func: (observer: Observer<Observable<any>>) => Observable<T>): Observable<T> {
  return Observable.create((observer: Observer<Observable<T>>) => {
    const signal = func(observer)
    observer.next(signal)
  }).concatMap((x: Observable<T>) => x)
}
