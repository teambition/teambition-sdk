'use strict'
import * as Rx from 'rxjs'
import * as chai from 'chai'
import {forEach} from './index'
import Model from '../../src/models/model'

const expect = chai.expect

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

export function expectDeepEqual(a: any, b: any) {
  forEach(a, (val, key) => {
    expect(val).to.deep.equal(b[key])
  })
}

export function notInclude(collection: any[], ele: any) {
  let result = true
  forEach(collection, val => {
    if (val['_id'] === ele['_id']) {
      result = false
    }
  })
  return result
}
