'use strict'
import {forEach} from './'

const trackIndex = {}

export const trackOne = (target: any, index?: string) => {
  const _id = index ? index : target._id
  if (_id && trackIndex[_id].indexOf(target) === -1) {
    trackIndex[_id].push(target)
  }
}

export const trackObject = (target: any) => {
  const _id = target._id
  if (_id) {
    trackIndex[_id] = []
    forEach(target, (val: any, key: string) => {
      Object.defineProperty(target, key, {
        set(newValue: any) {
          forEach(trackIndex[_id], (trackVal: any) => {
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
}

export const trackCollection = (index: string, target: any[]) => {
  if (target instanceof Array) {
    trackIndex[index] = []
    const splice = target.splice
    const push = target.push
    target.splice = function() {
      forEach(trackIndex[index], function(collection: any[]) {
        splice.apply(collection, arguments)
      })
      return splice.apply(target, arguments)
    }
    target.push = function() {
      forEach(trackIndex[index], function(collection: any[]) {
        push.apply(collection, arguments)
      })
      return push.apply(target, arguments)
    }
  }else {
    throw new Error('Could not track a none array object')
  }
}
