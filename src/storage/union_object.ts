'use strict'
import {forEach, clone} from '../utils'

let $id = 1
export const ObjectIndex = {}

export class BaseObject {
  public $id = `$${$id}`

  constructor(target: any) {
    const data = clone(target)
    const objectIndex = ObjectIndex[`$${$id}`] = {
      dataKeys: []
    }
    forEach(data, (val: any, key: string) => {
      objectIndex.dataKeys.push(key)
      this[key] = val
    })
    $id ++
  }

  public $digest() {}
}
