'use strict'
import {forEach} from './index'

declare const zone

const trackIndex = {}

const _zone = typeof zone !== 'undefined' ? zone.fork() : {
  run: (fn) => {
    if (typeof fn === 'function') fn()
  }
}

export const trackOne = (index: string, target: any) => {
  const indexes =  trackIndex[index]
  if (indexes.indexOf(target) === -1) {
    indexes.push(target)
  }
}

const $digest = (target) => {
  if (!target || typeof target.$digest !== 'function') return -1
  let timer: number
  _zone.run(() => {
    if (target.timer) clearTimeout(target.timer)
    timer = setTimeout(() => {
      target.$digest()
      delete target.timer
    })
    target.timer = timer
  })
  return timer
}

export const trackObject = (target: any, unionKey = target._id) => {
  /* istanbul ignore if */
  if (!unionKey) return
  trackIndex[unionKey] = []
  forEach(target, (val: any, key: string) => {
    Object.defineProperty(target, key, {
      set(newValue: any) {
        forEach(trackIndex[unionKey], (trackVal: any) => {
          const oldVal = trackVal[key]
          if (oldVal !== newValue) $digest(trackVal)
          trackVal[key] = newValue
        })
        val = newValue
      },
      get() {
        return val
      },
      enumerable: true,
      configurable: true
    })
  })
}

const collectionHandler = (target: Array<any>, method: string, trackList: any[]): any => {
  /* istanbul ignore if */
  if (typeof Proxy !== 'undefined' && typeof Reflect !== 'undefined') {
    return new Proxy(target, {
      apply (target, ctx, args) {
        forEach(trackList, (collection: any[]) => {
          Reflect.apply(target[method], collection, args)
        })
        return Reflect.apply(target[method], ctx, args)
      }
    })
  }else {
    const originFn = target[method]
    return (...args) => {
      forEach(trackList, function(collection: any[]) {
        originFn.apply(collection, args)
      })
      return originFn.apply(target, args)
    }
  }
}

export const trackCollection = (index: string, target: any[]) => {
  if (!(target instanceof Array)) throw new Error('Could not track a none array object')
  const trackList = trackIndex[index] = []
  const proxyList = ['splice', 'push', 'unshift', 'pop']
  forEach(proxyList, (val) => {
    target[val] = collectionHandler(target, val, trackList)
  })
}
