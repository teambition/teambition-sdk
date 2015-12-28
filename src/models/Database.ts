'use strict'
import {clone, assign} from '../utils'
import {trackObject, trackOne} from '../utils/track'
import {BaseObject, ObjectIndex} from './BaseObject'

class DataBase {
  private data: {
    [index: string]: any
  }

  private timeoutIndex: {
    [index: string]: {
      timer: number
      begin: number
      expire: number
    }
  }

  constructor() {
    this.data = {}
    this.timeoutIndex = {}
  }

  storeOne(index: string, data: any, expire = 0) {
    if (this.data[index]) {
      throw 'Can not store an existed data'
    }else {
      const result = this.data[index] = clone({}, data)
      if (expire && typeof expire === 'number') {
        let timeoutIndex = window.setTimeout(() => {
          delete this.data[index]
        }, expire)
        this.timeoutIndex[index] = {
          timer: timeoutIndex,
          begin: Date.now(),
          expire: expire
        }
      }
      trackObject(result)
    }
  }

  updateOne(index: string, patch: any, expire = 0): void {
    const _patch = clone({}, patch)
    let val = this.data[index]
    if (val) {
      if (typeof patch === 'object') {
        val = assign(val, _patch)
        if (expire && typeof expire === 'number') {
          const timer = this.timeoutIndex[index].timer
          this.timeoutIndex[index].expire = expire
          this.timeoutIndex[index].begin = Date.now()
          window.clearTimeout(timer)
          window.setTimeout(() => {
            delete this.data[index]
          }, expire)
        }
        this.data[index] = val
      }else {
        throw 'Patch should be Object'
      }
    }else {
      throw 'Data is not existed, can not update'
    }
  }

  getOne(index: string): any {
    const data = this.data[index]
    if (data) {
      const object = new BaseObject(data)
      trackOne(object)
      return object
    }else {
      return false
    }
  }

  getExpire(index: string) {
    const timerIndex = this.timeoutIndex[index]
    return timerIndex.begin - timerIndex.expire
  }
}

export default new DataBase()
