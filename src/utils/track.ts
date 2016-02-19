'use strict'
import {forEach, isFunction} from './index'
import {BaseObject} from '../storage/union_object'

declare const zone

export type onChangeFn = (patch: Map<BaseObject, any>) => any

const trackIndex = new Map<string, any[]>()

const _zone = typeof zone !== 'undefined' ? zone.fork() : {
  run: (fn) => {
    if (isFunction(fn)) fn()
  }
}

// 用的时候记得清理这个对象，用来存储 onChange 里面改变了哪些key, value
const _tempPatch = {}

const collectionOnchangeFnMap = new Map<string, onChangeFn>()
const onChange = function (patch: Map<BaseObject, any>) {
  return patch
}

export const trackOne = (index: string, target: any) => {
  const indexes = trackIndex.get(index)
  if (indexes.indexOf(target) === -1) {
    indexes.push(target)
  }
  if (typeof target.onChange !== 'function') {
    collectionOnchangeFnMap.set(index, onChange)
    Object.defineProperty(target, 'onChange', {
      get() {
        return collectionOnchangeFnMap.get(index)
      },
      set(newValue: onChangeFn) {
        collectionOnchangeFnMap.set(index, newValue)
      }
    })
  }
}

const $digest = (target: BaseObject, key, value) => {
  if (!target || !(target instanceof BaseObject)) return -1
  let timer: number
  const targetId = target.$id
  let tempPatch = _tempPatch[targetId]
  if (!tempPatch) tempPatch = _tempPatch[targetId] = {}
  tempPatch[key] = value
  _zone.run(() => {
    if (target.$timer) return
    timer = setTimeout(() => {
      target.onChange(tempPatch)
      delete _tempPatch[targetId]
      delete target.$timer
    })
    target.$timer = timer
  })
  return timer
}

export const trackObject = <T extends BaseObject>(target: T, unionKey = target['_id']) => {
  /* istanbul ignore if */
  if (!unionKey) return
  trackIndex.set(unionKey, [])
  forEach(target, (val: any, key: string) => {
    Object.defineProperty(target, key, {
      set(newValue: any) {
        forEach(trackIndex.get(unionKey), (trackVal) => {
          const oldVal = trackVal[key]
          if (oldVal !== newValue) $digest(trackVal, key, newValue)
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
  const trackList = []
  trackIndex.set(index, trackList)
  const proxyList = ['splice', 'push', 'unshift', 'pop']
  forEach(proxyList, (val) => {
    target[val] = collectionHandler(target, val, trackList)
  })
}
