'use strict'
import {Schema, setSchema} from '../schemas/schema'

export function forEach<T>(target: Array<T>, eachFunc: (val: T, key: number) => void, inverse?: boolean): void

export function forEach<T>(target: {
  [index: string]: T
}, eachFunc: (val: T, key: string) => void, inverse?: boolean): void

export function forEach (target: any, eachFunc: (val: any, key: any) => void, inverse?: boolean) : void

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

export const assign = <T, U>(target: T, patch: U): T & U => {
  if (typeof patch !== 'object' || !patch) return
  forEach(patch, (val, key) => {
    target[key] = patch[key]
  })
  return <T & U>target
}

export const clone = <T>(origin: T): T => {
  /* istanbul ignore if */
  if (!origin || typeof origin !== 'object') {
    return
  }
  let target: any
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
      }
    }
    target[key] = val
  })
  return target
}

const s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
}

let uuidStack: string[] = []

export const uuid = () => {
  let UUID = s4() + s4()
  /* istanbul ignore next */
  while (uuidStack.indexOf(UUID) !== -1) {
    UUID = s4() + s4()
  }
  uuidStack.push(UUID)
  return UUID
}

export const dataToSchema = <T, U extends Schema> (data: T, SchemaClass: any): U => {
  return setSchema(new SchemaClass(), data)
}

export const datasToSchemas = <T, U extends Schema>(datas: T[], SchemaClass: any): U[] => {
  const result = new Array<U>()
  forEach(datas, (data: T, index: number) => {
    result.push(setSchema(new SchemaClass(), data))
  })
  return result
}

export const isFunction = (target: any) => {
  return typeof target === 'function'
}
