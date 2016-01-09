'use strict'
import {forEach} from '../utils'
import {IMemberData} from 'teambition'

export const setSchema = <T extends Schema>(target: T) => {
  forEach(target, (value, key) => {
    let hasSet = false
    target.$$keys.add(key)
    Object.defineProperty(target, key, {
      get() {
        return value
      },
      set(newVal: any) {
        hasSet = true
        value = newVal
        if (!hasSet) {
          target.$$keys.delete(key)
        }
      }
    })
  })
  return target
}

export class Schema {
  $$keys = new Set<string>()

  $$setData(member: IMemberData) {
    for (const key of this.$$keys) {
      this[key] = member[key]
    }
    console.log(this.$$keys)
    return this
  }
}
