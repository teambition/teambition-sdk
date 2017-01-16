'use strict'
import { forEach, dropEle } from '../utils/helper'

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

export const setSchema = <T>(target: Schema<T>, data: T): T & Schema<T> => {
  target.$$data = data
  forEach(target, (value, key) => {
    if (key === '$$data') {
      Object.defineProperty(target, key, {
        enumerable: false,
        configurable: true
      })
    } else if (key === '$$keys') {
      Object.defineProperty(target, key, {
        enumerable: false,
        set(newVal) {
          value = newVal
        },
        get() {
          return value
        }
      })
    } else {
      if (typeof data[key] === 'undefined' && !target[key]) {
        target.$$keys.add(key)
      }
      if ( ! (!(key in data) && (key in target)) ) {
        const originSet = Object.getOwnPropertyDescriptor(target, key).set
        Object.defineProperty(target, key, {
          get() {
            if (target.$$data) {
              return target.$$data[key]
            }
          },
          set(newVal: any) {
            if (typeof originSet === 'function') {
              originSet.call(this, newVal)
            }
            if (target.$$data) {
              target.$$data[key] = newVal
              target.$$keys.delete(key)
            }
          },
          configurable: true
        })
      }
    }
  })
  const $$keys = Object.keys(data)
  $$keys.forEach((key) => {
    target[key] = data[key]
  })
  return <any>target
}

export interface ISchema {
  $$schemaName?: string
  _requested?: number
}

export class Schema <T> {
  $$keys = new Set<string>()
  $$data: T
  $$children: ChildMap
  $$bloodyParent: BloodyParent
  $$unionFlag: string
  $$schemaName: string
  _requested?: number

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
    this.$$schemaName = this.$$schemaName
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
          const _unionFlag = this[this.$$unionFlag]
          if (!val) {
            return
          }
          if (bloodyParentValue && bloodyParentMap.has(bloodyParentValue)) {
            dropEle(bloodyParentValue, bloodyParentMap.get(bloodyParentValue))
          }
          const newArr = bloodyParentMap.get(val)
          if (!newArr) {
            bloodyParentMap.set(val, [ _unionFlag ])
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
    target.prototype.$$schemaName = name
  }
}

const cacheSchemaMap = new WeakMap<any, ChildMap>()

/**
 * 对 schema 上的属性注解
 * 指定一个 child
 */
export function child (type: 'Array' | 'Object', schemaName: string, unionFlag = '_id') {
  return function(target: any, key: string) {
    if (!target.$$children) {
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
        },
        set (val: {
          key: string
          type: 'Object' | 'Array',
          schemaName: string
          unionFlag: string
        }) {
          const weakMap = cacheSchemaMap.get(this)
          weakMap.set(val.key, {
            type: val.type,
            schemaName: val.schemaName,
            unionFlag: val.unionFlag
          })
        }
      })
    } else {
      target.$$children = { key, type, schemaName, unionFlag }
    }
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

/**
 * 用于注解对象上的一个属性，这个属性通常是一个 id
 * 这个 id 代表着是这个被注解对象的血亲
 * 一个对象在它的血亲被删除后也会被删除
 * 这个注解对应 schemaName 在运行时才能拿到的情况
 */
export function bloodyParentWithProperty(propertyName: string, unionFlag = '_id') {
  return function (target: any, key: string) {
    Object.defineProperty(target, '$$bloodyParent', {
      get() {
        return {
          key,
          unionFlag,
          schemaName: this[propertyName],
          [unionFlag]: this[key]
        }
      },
      enumerable: false,
      configurable: false
    })
  }
}
