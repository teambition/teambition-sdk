'use strict'
import {forEach} from '../utils'

let $id = 1
export const ObjectIndex = {}

export class BaseObject {
  public $id = `$${$id}`

  public $timer: number

  constructor(target?: any) {
    $id ++
    const objectIndex = ObjectIndex[`$${$id}`] = {
      dataKeys: []
    }
    if (typeof target !== 'object') return
    forEach(target, (val: any, key: string) => {
      objectIndex.dataKeys.push(key)
      this[key] = val
    })
  }

  public onChange(patch) {
    return patch
  }
}
