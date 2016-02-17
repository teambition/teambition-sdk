'use strict'
import {setSchema, Schema} from '../schemas/schema'

export function forEach<T>(target: Array<T>, eachFunc: (val: T, key: number) => void, inverse?: boolean): void

export function forEach<T>(target: {
  [index: string]: T
}, eachFunc: (val: T, key: string) => void, inverse?: boolean): void

export function forEach(target: any, eachFunc: (val: any, key: any) => void, inverse?: boolean) : void

export function forEach (target: any, eachFunc: (val: any, key: any) => any, inverse?: boolean) {
  let length: number
  if (target instanceof Array) {
    length = target.length
    if (!inverse) {
      for (let i = 0; i < length; i++) {
        eachFunc(target[i], i)
      }
    }else {
      for (let i = length - 1; i >= 0; i--) {
        eachFunc(target[i], i)
      }
    }

  }else {
    const keys = Object.keys(target)
    let key: string
    length = keys.length
    for (let i = 0; i < length; i ++) {
      key = keys[i]
      eachFunc(target[key], key)
    }
  }
}

export const assign = <T, U>(target: T, origin: U): T & U => {
  forEach(origin, (val, key) => {
    target[key] = origin[key]
  })
  return <T & U>target
}

export const clone = <T>(origin: T): T => {
  if (typeof origin === 'undefined' || typeof origin !== 'object') return
  let target
  if (origin instanceof Array) {
    target = new Array()
  }else {
    target = Object.create(null)
  }
  forEach(origin, (val: any, key: string) => {
    if (typeof val === 'object') {
      // null
      if (val) {
        target[key] = clone(val)
      }else {
        target[key] = val
      }
    }
    target[key] = val
  })
  return target
}

const s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

let uuidStack = []

export const uuid = () => {
  let UUID = s4() + s4()
  /* istanbul ignore next */
  while (uuidStack.indexOf(UUID) !== -1) {
    UUID = s4() + s4()
  }
  uuidStack.push(UUID)
  return UUID
}

export const datasToSchemas = <T, U extends Schema>(datas: T[], Schema: any): U[] => {
  const result = new Array<U>()
  forEach(datas, (data: T, index: number) => {
    result.push(setSchema(new Schema(), data))
  })
  return result
}

export const noop = function() {
  return
}
