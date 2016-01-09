'use strict'
import {clone, assign, forEach} from '../utils'
import {trackObject, trackOne, trackCollection} from '../utils/track'
import {BaseObject} from './BaseObject'

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

  private typeIndex: {
    [index: string]: string
  }

  private collectionIndex: {
    [index: string]: string[]
  }

  private dataMaps: {
    [index: string]: string[]
  }

  constructor() {
    this.data = {}
    this.timeoutIndex = {}
    this.typeIndex = {}
    this.dataMaps = {}
    this.collectionIndex = {}
  }

  storeOne(index: string, data: any, expire = 0) {
    if (!this.data[index]) {
      const result = this.data[index] = data
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
      this.typeIndex[index] = 'object'
    }
  }

  storeCollection(index: string, collection: any[], expire = 0) {
    const indexes = this.collectionIndex[index] = []
    if (!this.data[index]) {
      const result = []
      forEach(collection, (val: any, key: string) => {
        const cache = this.getOne(val._id)
        if (cache) {
          result.push(cache)
        }else {
          result.push(val)
          this.storeOne(val._id, val)
        }
        const maps = this.dataMaps[val._id]
        if (maps) {
          maps.push(val._id)
        }else {
          this.dataMaps[val._id] = [val._id]
        }
        indexes.push(val._id)
      })
      this.data[index] = result
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
      trackCollection(index, result)
      this.typeIndex[index] = 'collection'
    }
  }

  updateCollection(index: string, patch: any[]) {
    const cache: any[] = this.data[index]
    if (cache && patch instanceof Array) {
      const indexs = this.collectionIndex[index]
      forEach(patch, (val: any, key: number) => {
        const oldEle = cache[key]
        if (oldEle._id === val._id) {
          assign(oldEle, val)
        }else {
          const targetId = val._id
          if (indexs.indexOf(targetId) === -1) {
            cache.splice(key, 0, val)
            indexs.splice(key, 0, targetId)
            this.storeOne(val._id, val)
          }else {
            const oldIndex = indexs.indexOf(targetId, key)
            cache.splice(oldIndex, 1)
            indexs.splice(oldIndex, 1)
            cache.splice(key, 0, val)
            indexs.splice(key, 0, targetId)
          }
        }
      })
    }
  }

  updateOne(index: string, patch: any, expire = 0): void {
    const _patch = clone(patch)
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

  getOne<T>(index: string): any {
    const data = this.data[index]
    let result: any
    if (data) {
      if (this.typeIndex[index] === 'collection') {
        result = clone(data)
        trackOne(result, index)
      }else {
        result = new BaseObject(data)
        trackOne(result)
      }
      return result
    }else {
      return false
    }
  }

  delete(index: string) {
    delete this.data[index]
  }

  getExpire(index: string) {
    const timerIndex = this.timeoutIndex[index]
    return timerIndex.begin - timerIndex.expire
  }
}

export default new DataBase()
