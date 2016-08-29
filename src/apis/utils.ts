'use strict'
import 'rxjs/add/operator/publishReplay'
import { Subscriber } from 'rxjs/Subscriber'
import { TeardownLogic } from 'rxjs/Subscription'
import { Observer } from 'rxjs/Observer'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

export function monkeyPatchObservableCreate(): void {
  const originCreate = Observable.create
  Observable.create = (subscribe?: <R>(subscriber: Subscriber<R>) => TeardownLogic) => {
    const loading$ = new BehaviorSubject(true)
    const monkeyPatchedSubscribe = <R>(subscriber: Subscriber<R>): TeardownLogic => {
      const originNext = subscriber.next
      const originErr = subscriber.error
      subscriber.next = (...args: any[]) => {
        loading$.next(false)
        return originNext.apply(subscriber, args)
      }
      subscriber.error = (...args: any[]) => {
        loading$.next(false)
        return originErr.apply(subscriber, args)
      }
      const tearDownLogic = subscribe.call(null, subscriber)
      return () => {
        if (typeof tearDownLogic === 'function') {
          tearDownLogic()
        }
        // teardown loading$ stream
        loading$.unsubscribe()
      }
    }
    const observable = originCreate.call(Observable, monkeyPatchedSubscribe)
    observable.loading$ = loading$
    return observable
  }
}

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
  const loading$ = new BehaviorSubject(true)
  const result = Observable.create((observer: Observer<Observable<T>>) => {
    const signal = func(observer)
    observer.next(signal)
  })
    .catch((e: any) => {
      loading$.next(false)
      return Observable.throw(e)
    })
    .concatMap((x: Observable<T>) => x)
    .publishReplay(1)
    .refCount()

  const originSubscribe = result.subscribe

  result.subscribe = (...args: any[]) => {
    loading$.next(false)
    return originSubscribe.apply(result, args)
  }

  result.loading$ = loading$
  return result
}
