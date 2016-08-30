'use strict'
/* istanbul ignore next */
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
  } else if (typeof FormData !== 'undefined' && target instanceof FormData) {
    return
  } else if (typeof File !== 'undefined' && target instanceof File) {
    for (let x in target) {
      eachFunc(target[x], x)
    }
    return
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
}
