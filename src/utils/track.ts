'use strict'
import {forEach} from './'

const trackIndex = {}

export const trackOne = (target: any) => {
  const _id = target._id
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
