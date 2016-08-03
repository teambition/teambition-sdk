'use strict'
import { forEach, assign } from '../utils/index'
import * as Schemas from './index'

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
  _requested?: number
  checkSchema?: () => boolean
}

export class Schema {
  $$keys = new Set<string>()
  $$data: any
  $$bloodyParent: {
    _id: string
    schemaName: string
  }
  $$children: string[]
  $$parents: string[]

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

/**
 * 指定一个 child
 */

export function child (type: 'Array' | 'Object', schemaName: string, desc: PropertyDescriptor) {
  return function(target: any, key: string) {
    const oldVal = target[key]
    desc.get = function () {
      if (type === 'Object') {
        target[key] = setSchema(new Schemas[`${schemaName}Schema`], target[key])
      } else if (type === 'Array') {
        if (oldVal instanceof Array) {
          target[key] = oldVal.map(val => {
            const _id = val._id
            if (_id && target.$$children.indexOf(_id) === -1) {
              target.$$children.push(_id)
            }
            return setSchema(new Schemas[`${schemaName}Schema`], target[key])
          })
        } else {
          throw new Error(`this property is not array ${ key }, target: ${ JSON.stringify(target) }`)
        }
      }
    }
  }
}

/**
 * 用于注解对象上的一个属性，这个属性通常是一个 id
 * 这个 id 代表着是这个被注解对象的血亲
 * 一个对象在它的血亲被删除后也会被删除
 */
export function bloodyParent(schemaName: string) {
  return function (target: any, key: string) {
    Object.defineProperty(target, '$$bloodyParent', {
      get() {
        return {
          _id: target[key],
          schemaName: schemaName
        }
      },
      enumerable: false,
      configurable: false
    })
  }
}
