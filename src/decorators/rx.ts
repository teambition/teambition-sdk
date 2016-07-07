'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subscription } from 'rxjs/Subscription'

export function removeObserver <T> (observable: Observable<T>, observer: Observer<T>, _observers: Observer<T>[]) {
  const originSubscribe = observable.subscribe
  observable.subscribe = function () {
    const result: Subscription = originSubscribe.apply(observable, arguments)
    const originUnsubscribe = result.unsubscribe
    result.unsubscribe = function () {
      const index = _observers.indexOf(observer)
      _observers.splice(index, 1)
      return originUnsubscribe.apply(result, arguments)
    }
    return result
  }
}