'use strict'
import {forEach} from '../utils/index'

let $id = 1
export const ObjectIndex = new Map<string, {
  dataKeys: string[]
}>()

export class BaseObject {
  public $id = `$${$id}`

  public $timer: number

  constructor(target?: any) {
    $id ++
    const objectIndex = {
      dataKeys: []
    }
    if (typeof target !== 'object') return
    forEach(target, (val: any, key: string) => {
      objectIndex.dataKeys.push(key)
      this[key] = val
    })
    ObjectIndex.set(`$${$id}`, objectIndex)
  }

  public onChange(patch: any) {
    return patch
  }
}
