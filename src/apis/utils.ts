'use strict'
import 'rxjs/add/operator/publishReplay'
import { Observer } from 'rxjs/Observer'
import { Observable } from 'rxjs/Observable'

export function observableError<T>(observer: Observer<T>, err: Error): Observable<T> {
  observer.error(err)
  observer.complete()
  return Observable.of(null)
}

export function errorHandler<T>(observer: Observer<Observable<T>>, err: Error): Observable<T> {
  observer.error(err)
  observer.complete()
  return Observable.of(null)
}

export function makeColdSignal <T> (func: (observer: Observer<Observable<T>>) => Observable<T>): Observable<T> {
  return Observable.create((observer: Observer<Observable<T>>) => {
    const signal = func(observer)
    observer.next(signal)
  })
    .switch()
}
