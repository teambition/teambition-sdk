'use strict'
import * as Rx from 'rxjs'

const SignalMap = new Map<string, Map<string, Rx.Observable<any>>>()

const ObserverMap = new Map<string, Rx.Observer<any>>()

export function flushsignals (_id?: string) {
  if (typeof _id === 'string') {
    SignalMap.get(_id).clear()
    SignalMap.get(_id).clear()
  }else {
    SignalMap.clear()
    ObserverMap.clear()
  }
}

export type SignalType = 'set' | 'delete' | 'update'

export function createNewsignal <T>(_id: string, type: SignalType, data?: T): Rx.Observable<T> {
  const observerNamespace = `${_id}:${type}`
  const oldObserver = ObserverMap.get(observerNamespace)
  let destsignal: Rx.Observable<T>
  if (oldObserver) {
    oldObserver.next(data)
    return SignalMap.get(_id).get(type)
  }else {
    destsignal = Rx.Observable.create((observer: Rx.Observer<T>) => {
      ObserverMap.set(observerNamespace, observer)
      observer.next(data)
    })
    let maps = SignalMap.get(_id)
    if (!maps) {
      maps = new Map<string, Rx.Observable<T>>()
      SignalMap.set(_id, maps)
    }else {
      const signal = maps.get(type)
      if (signal) {
        destsignal = destsignal.merge(signal)
      }
    }
    maps.set(type, destsignal)
  }
  return destsignal
}
