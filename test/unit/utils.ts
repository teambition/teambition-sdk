'use strict'
import * as chai from 'chai'
import BaseModel from '../../src/models/BaseModel'
import { Schema } from '../../src/schemas/schema'
import { forEach } from './index'

const expect = chai.expect

export function expectDeepEqual(a: any, b: any) {
  if (typeof a !== 'object') {
    throw new Error(`a is not object, can not use deep equal: ${a}`)
  }
  if (typeof b !== 'object') {
    throw new Error(`a is not object, can not use deep equal: ${b}`)
  }
  const isSchema = '$$unionFlag' in a
  const origin = isSchema ? b : a
  const other = isSchema ? a : b
  forEach(origin, (val, key) => {
    if (key !== '_requested' && key !== '$$schemaName') {
      expect(val).to.deep.equal(other[key])
    }
  })
}

export function notInclude(collection: any[], ele: any) {
  let result = true
  const unionFlag = ele['_id']
  forEach(collection, val => {
    if (val['_id'] === unionFlag) {
      result = false
    }
  })
  return result
}

export function flush() {
  BaseModel.DataBase.flush()
}
