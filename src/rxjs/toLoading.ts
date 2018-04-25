'use strict'
import { Observable } from 'rxjs/Observable'
import { Operator } from 'rxjs/Operator'
import { Subscriber } from 'rxjs/Subscriber'

declare module 'rxjs/Observable' {
  interface Observable<T> {
    toLoading: typeof toLoading
  }
}

export function toLoading<T>(this: Observable<T>): Observable<boolean> {
  return this.lift(new ToLoadingOperator())
}

class ToLoadingOperator<T> implements Operator<T, boolean> {
  call(subscriber: Subscriber<boolean>, source: any): any {
    return source._subscribe(new ToLoadingSubscriber(subscriber))
  }
}

class ToLoadingSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<boolean>) {
    super(destination)
    this.destination.next(true)
  }

  protected _next(_value: T) {
    this.destination.next(false)
    this.destination.complete()
  }

  protected _error(_reason?: any) {
    this.destination.next(false)
    this.destination.complete()
  }
}

Observable.prototype.toLoading = toLoading
