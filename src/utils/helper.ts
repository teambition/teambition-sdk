'use strict'

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

export const clone = <T>(origin: T, oldSet = new WeakSet<any>()): T => {
  /* istanbul ignore if */
  if (origin === null) {
    return null
  }
  oldSet.add(origin)
  /* istanbul ignore if */
  if (!origin || typeof origin !== 'object') {
    return void 0
  }
  let target: any
  if (origin instanceof Array) {
    target = new Array()
  } else {
    target = { }
  }
  forEach(origin, (val: any, key: string) => {
    if (typeof val === 'object') {
      // null
      if (val && !oldSet.has(val)) {
        target[key] = clone(val, oldSet)
      } else {
        target[key] = val
      }
    } else {
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

export function capitalizeFirstLetter(str: string) {
  const upper = str[0].toUpperCase()
  if (str[0] === upper) {
    return str
  }
  return upper + str.slice(1)
}

/**
 * 对比第一个对象上有没有值与第二个上不同
 * @param first  assign(target, patch) 中的 patch
 * @param second assign(target, patch) 中的 target
 */
export function diffEle (first: any, second: any): boolean {
  let result = false
  forEach(first, (val, key) => {
    if (val !== second[key]) {
      result = true
      return false
    }
    return true
  })
  return result
}

/**
 * refer to https://github.com/github/fetch/blob/v1.0.0/fetch.js#L313
 * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
 * headers according to the format described here:
 * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
 * This method parses that string into a user-friendly key/value pair object.
 */
export function parseHeaders(rawHeader: string) {
  const head = Object.create(null)
  const pairs = rawHeader.trim().split('\n')
  pairs.forEach(function(header) {
    const split = header.trim().split(':')
    const key = split.shift().trim()
    const value = split.join(':').trim()
    head[key] = value
  })
  return head
}

export function isObject(obj: any): boolean {
  return typeof obj === 'object'
}
