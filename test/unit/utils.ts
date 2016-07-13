'use strict'
import * as chai from 'chai'
import BaseModel from '../../src/models/BaseModel'
import { forEach } from './index'

const expect = chai.expect

export function expectDeepEqual(a: any, b: any) {
  forEach(a, (val, key) => {
    if (key !== '_requested') {
      expect(val).to.deep.equal(b[key])
    }
  })
}

export function notInclude(collection: any[], ele: any) {
  let result = true
  forEach(collection, val => {
    if (val['_id'] === ele['_id']) {
      result = false
    }
  })
  return result
}

export function flush() {
  BaseModel.DataBase.flush()
}
