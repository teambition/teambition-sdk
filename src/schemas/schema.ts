'use strict'
import { forEach, dropEle } from '../utils/index'

export const bloodyParentMap = new Map<string, string[]>()

export type ChildMap = Map<string, {
  type: 'Object' | 'Array'
  schemaName: string
  unionFlag: string
  position?: {
    [index: string]: string
  }
}>

export interface BloodyParent {
  key: string
  unionFlag: string
  schemaName: string
  [index: string]: string
}

export const setSchema = <T extends Schema>(target: T, data: any): T => {
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
  const $$keys = Object.keys(data)
  $$keys.forEach((key) => {
    target[key] = data[key]
  })
  return target
}

export interface ISchema<T> {
  $$keys?: Set<string>
  $$data?: T
  $$bloodyParent?: BloodyParent
  $$children?: ChildMap
  _requested?: number
  checkSchema?: () => boolean
}

export class Schema {
  $$keys = new Set<string>()
  $$data: any
  $$children: ChildMap
  $$bloodyParent: BloodyParent
  $$unionFlag: string

  constructor() {
    let _$$unionFlag: string
    Object.defineProperty(this, '$$unionFlag', {
      get () {
        return _$$unionFlag
      },
      set (val: string) {
        _$$unionFlag = val
      },
      enumerable: false
    })
  }

  setBloodyParent() {
    const bloodyParent = this.$$bloodyParent
    if (bloodyParent) {
      const unionFlag = this[this.$$unionFlag]
      let bloodyParentValue: string = this[bloodyParent.key]

      if (bloodyParentValue) {
        const children = bloodyParentMap.get(bloodyParentValue)
        if (!children) {
          bloodyParentMap.set(bloodyParentValue, [ unionFlag ])
        } else if (children.indexOf(unionFlag) === -1) {
          children.push(unionFlag)
        }
      }
      Object.defineProperty(this, bloodyParent.key, {
        set(val: string) {
          const unionFlag = this[this.$$unionFlag]
          if (!val) {
            return
          }
          if (bloodyParentValue && bloodyParentMap.has(bloodyParentValue)) {
            dropEle(bloodyParentValue, bloodyParentMap.get(bloodyParentValue))
          }
          const newArr = bloodyParentMap.get(val)
          if (!newArr) {
            bloodyParentMap.set(val, [ unionFlag ])
          } else if (newArr.indexOf(val) === -1) {
            newArr.push(val)
          }
          bloodyParentValue = val
        },
        get() {
          return bloodyParentValue
        }
      })
    }
  }

  checkSchema(): boolean {
    return !this.$$keys.size
  }
}

export function schemaName (name: string) {
  return function(target: any) {
    target.prototype.getSchemaName = function () {
      return name
    }
  }
}

const cacheSchemaMap = new WeakMap<any, ChildMap>()

/**
 * 对 schema 上的属性注解
 * 指定一个 child
 */
export function child (type: 'Array' | 'Object', schemaName: string, unionFlag = '_id') {
  return function(target: any, key: string) {
    Object.defineProperty(target, '$$children', {
      get() {
        if (!cacheSchemaMap.has(this)) {
          cacheSchemaMap.set(this, new Map<any, any>())
        }
        const weakMap = cacheSchemaMap.get(this)
        weakMap.set(key, {
          type,
          schemaName,
          unionFlag
        })
        return weakMap
      }
    })
  }
}

/**
 * 用于注解对象上的一个属性，这个属性通常是一个 id
 * 这个 id 代表着是这个被注解对象的血亲
 * 一个对象在它的血亲被删除后也会被删除
 */
export function bloodyParent(schemaName: string, unionFlag = '_id') {
  return function (target: any, key: string) {
    Object.defineProperty(target, '$$bloodyParent', {
      get() {
        return {
          key,
          unionFlag,
          schemaName,
          [unionFlag]: this[key]
        }
      },
      enumerable: false,
      configurable: false
    })
  }
}
