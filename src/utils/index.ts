'use strict'
import { ISchema, setSchema } from '../schemas/schema'

export function forEach<T> (target: Array<T>, eachFunc: (val: T, key: number) => void, inverse?: boolean): void

export function forEach<T> (
  target: {
    [index: string]: T
  },
  eachFunc: (val: T, key: string) => void, inverse?: boolean
): void

export function forEach (target: any, eachFunc: (val: any, key: any) => void, inverse?: boolean): void

export function forEach (target: any, eachFunc: (val: any, key: any) => any, inverse?: boolean) {
  let length: number
  if (target instanceof Array) {
    length = target.length
    if (!inverse) {
      let i = -1
      while (++i < length) {
        if (eachFunc(target[i], i) === false) {
          break
        }
      }
    } else {
      let i = length
      while (i --) {
        if (eachFunc(target[i], i) === false) {
          break
        }
      }
    }

  } else if (typeof target === 'object') {
    const keys = Object.keys(target)
    let key: string
    length = keys.length
    let i = -1
    while (++i < length) {
      key = keys[i]
      if (eachFunc(target[key], key) === false) {
        break
      }
    }
  }
  return target
}

export const assign = <T, U>(target: T, patch: U): T & U => {
  if (typeof target !== 'object' || !target) {
    return void 0
  }
  if (typeof patch !== 'object' || !patch) {
    return <any>target
  }
  forEach(patch, (val, key) => {
    target[key] = patch[key]
  })
  return <T & U>target
}

export const clone = <T>(origin: T): T => {
  /* istanbul ignore if */
  if (origin === null) {
    return null
  }
  /* istanbul ignore if */
  if (!origin || typeof origin !== 'object') {
    return void 0
  }
  let target: any
  if (origin instanceof Array) {
    target = new Array()
  }else {
    target = {}
  }
  forEach(origin, (val: any, key: string) => {
    if (typeof val === 'object') {
      // null
      if (val) {
        target[key] = clone(val)
      }else {
        target[key] = val
      }
    }else {
      target[key] = val
    }
  })
  return target
}

export const concat = <T>(target: T[], patch: T[]): T[] => {
  if (!(patch instanceof Array)) {
    return target
  }
  forEach(patch, ele => {
    target.push(ele)
  })
  return target
}

const s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
}

const uuidStack: string[] = []

export const uuid = () => {
  let UUID = s4() + s4()
  /* istanbul ignore next */
  while (uuidStack.indexOf(UUID) !== -1) {
    UUID = s4() + s4()
  }
  uuidStack.push(UUID)
  return UUID
}

export const dataToSchema = <U extends ISchema<U>> (data: any, SchemaClass: any): U => {
  return setSchema(new SchemaClass(), data)
}

export const datasToSchemas = <U>(datas: any[], SchemaClass: any): U[] => {
  const result = new Array<U>()
  forEach(datas, data => {
    result.push(setSchema(new SchemaClass(), data))
  })
  return result
}

export function dropEle<T>(ele: T, arr: T[]): T[] {
  forEach(arr, (_ele, pos) => {
    const isEqual = ele === _ele
    if (isEqual) {
      arr.splice(pos, 1)
    }
    return !isEqual
  })
  return arr
}
