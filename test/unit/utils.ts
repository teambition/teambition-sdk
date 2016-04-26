'use strict'
import * as Rx from 'rxjs'

export function timeout <T> (signal: Rx.Observable<T>, delay: number) {
  return Rx.Observable.create((observer: Rx.Observer<T>) => {
    setTimeout(() => {
      signal.catch(e => {
        observer.error(e)
        return Rx.Observable.empty()
      })
      .subscribe((r: T) => {
        observer.next(r)
      })
    }, delay)
  })
}
