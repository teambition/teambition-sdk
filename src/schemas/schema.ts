'use strict'
import {forEach} from '../utils/index'

export const setSchema = <T extends Schema>(target: T, data: any): T => {
  target.$$keys.forEach((key) => {
    target[key] = data[key]
  })
  target.$$data = data
  forEach(target, (value, key) => {
    if (key === '$$data') {
      Object.defineProperty(target, key, {
        enumerable: false,
        configurable: true
      })
    }else if (key === '$$keys') {
      Object.defineProperty(target, key, {
        enumerable: false,
        set(newVal) {
          value = newVal
        },
        get() {
          return value
        }
      })
    }else {
      if (typeof data[key] === 'undefined') {
        target.$$keys.add(key)
      }
      Object.defineProperty(target, key, {
        get() {
          if (target.$$data) {
            return target.$$data[key]
          }
        },
        set(newVal: any) {
          if (target.$$data) {
            target.$$data[key] = newVal
            target.$$keys.delete(key)
          }
        },
        configurable: true
      })
    }
  })
  return target
}

export class Schema {
  $$keys = new Set<string>()
  $$data: any
}

export function schemaName (name: string) {
  return function(target: any) {
    target.prototype.getSchemaName = function () {
      return name
    }
  }
}
