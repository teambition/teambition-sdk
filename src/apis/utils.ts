'use strict'
import 'rxjs/add/operator/switch'
import { Observer } from 'rxjs/Observer'
import { Observable } from 'rxjs/Observable'

export function makeColdSignal <T> (func: () => Observable<T>): Observable<T> {
  return Observable.create((observer: Observer<Observable<T>>) => {
    const signal = func()
    observer.next(signal)
  })
    ._switch()
}
