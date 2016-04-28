'use strict'
import * as Rx from 'rxjs'
import Model from '../../src/models/model'

export function timeout <T> (signal: Rx.Observable<T>, delay: number): Rx.Observable<T> {
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

export function flushDatabase () {
  Model.DataBase.clearAll()
}
