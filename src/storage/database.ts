'use strict'
import {clone, assign, forEach} from '../utils'
import {trackObject, trackOne, trackCollection} from '../utils/track'
import {BaseObject} from './union_object'

export default class DataBase {
  /**
   * 存储所有的数据，以唯一的 key 为索引
   */
  private data: {
    [index: string]: any
  }

  /**
   * 时间缓存，控制缓存失效
   */
  private timeoutIndex: {
    [index: string]: {
      timer: any
      begin: number
      expire: number
    }
  }

  /**
   * 用来存储一个数据类型
   * 比如可以通过 taskid 获取它索引的是 object 类型的数据
   * 通过 tasklist:${tasklistid}:tasks 获取它是 collection 类型的数据
   */
  private typeIndex: {
    [index: string]: string
  }

  /**
   * 用来存储列表索引
   * tasklists:${tasklistid}:tasks 这种
   */
  private collectionIndex: {
    [index: string]: string[]
  }

  /**
   * 用来存储数据 -> 列表映射
   * 比如通过一个 taskid 可以知道它分别存储在
   * tasklists, my:recent:tasks, my:today:tasks 等几个列表中
   */
  private dataMaps: {
    [index: string]: string[]
  }

  constructor(private unionFlag = '_id') {
    this.data = {}
    this.timeoutIndex = {}
    this.typeIndex = {}
    this.dataMaps = {}
    this.collectionIndex = {}
  }

  store(index: string, data: any, expire = 0) {
	  if (data instanceof Array && data[0] && data[0][this.unionFlag]) {
      this.storeCollection(index, data, expire)
    }else {
      this.storeOne(index, data, expire)
    }
  }

  getOne<T>(index: string): T {
    const data = this.data[index]
    let result: any
    if (!data) return
    if (this.typeIndex[index] === 'collection') {
      result = []
      forEach(data, (val) => {
        result.push(this.data[val[this.unionFlag]])
      })
      trackOne(index, result)
    }else {
      result = new BaseObject(data)
      trackOne(result[this.unionFlag], result)
    }
    return result
  }

  delete(index: string) {
    delete this.data[index]
    const maps = this.dataMaps[index]
    if (maps && maps.length) {
      forEach(maps, (collectionIndex: string) => {
        const indexes = this.collectionIndex[collectionIndex]
        const collection = this.data[collectionIndex]
        const position = indexes.indexOf(index)
        indexes.splice(position, 1)
        collection.splice(position, 1)
      })
    }
  }

  getExpire(index: string) {
    const timerIndex = this.timeoutIndex[index]
    return timerIndex.expire - (Date.now() - timerIndex.begin)
  }

  update<T, U>(index: string, patch: T | Array<U>): void {
    const objectType = this.typeIndex[index]
    if (!objectType) return
    if (objectType === 'object') return this.updateOne(index, patch)
    if (objectType === 'collection') return this.updateCollection(index, <Array<U>>patch)
  }

  private storeOne(index: string, data: any, expire = 0) {
    const result = this.data[index] = data
    this.setExpire(index, expire)
    trackObject(result)
    this.typeIndex[index] = 'object'
  }

  private storeCollection(index: string, collection: any[], expire = 0) {
    const indexes = this.collectionIndex[index] = []
    const unionFlag = this.unionFlag
    if (this.data[index]) return
    const result = []
    forEach(collection, (val, key) => {
      const cache = this.data[val[unionFlag]]
      if (cache) {
        result.push(assign(cache, val))
      }else {
        result.push(val)
        this.storeOne(val[unionFlag], val)
      }
      const maps = this.dataMaps[val[unionFlag]]
      if (maps) {
        maps.push(index)
      }else {
        this.dataMaps[val[unionFlag]] = [index]
      }
      indexes.push(val[unionFlag])
    })
    this.data[index] = result
    this.setExpire(index, expire)
    trackCollection(index, result)
    this.typeIndex[index] = 'collection'
  }

  private setExpire(index: string, expire: number) {
    if (!(expire && typeof expire === 'number')) return
    const timer = this.timeoutIndex[index] ? this.timeoutIndex[index].timer : undefined
    if (typeof timer !== 'undefined') {
      clearTimeout(timer)
    }
    let timeoutIndex = setTimeout(() => {
      this.delete(index)
    }, expire)
    this.timeoutIndex[index] = {
      timer: timeoutIndex,
      begin: Date.now(),
      expire: expire
    }
  }

  private updateOne(index: string, patch: any): void {
    const _patch = clone(patch)
    let val = this.data[index]
    if (typeof patch !== 'object') throw 'A patch should be Object'
    val = assign(val, _patch)
    const expire = patch.expire
    this.setExpire(index, expire)
    this.data[index] = val
  }

  /**
   * @param  {string} index 存储索引
   * @param  {T[]} patch  新的列表内容
   * @return void
   */
  private updateCollection<T>(index: string, patch: T[]) {
    const cache: T[] = this.data[index]
    const unionFlag = this.unionFlag
    if (!(cache && patch instanceof Array)) return
    const indexs = this.collectionIndex[index]
    forEach(patch, (val, key) => {
      const oldEle = cache[key]
      if (oldEle && oldEle[unionFlag] === val[unionFlag]) {
        assign(oldEle, val)
      }else {
        const targetId = val[unionFlag]
        if (indexs.indexOf(targetId) === -1) {
          cache.splice(key, 0, val)
          indexs.splice(key, 0, targetId)
          this.storeOne(val[unionFlag], val)
        }else {
          const oldIndex = indexs.indexOf(targetId, key)
          const oldOne = cache[oldIndex]
          cache.splice(oldIndex, 1)
          indexs.splice(oldIndex, 1)
          cache.splice(key, 0, assign(oldOne, val))
          indexs.splice(key, 0, targetId)
        }
      }
    })
  }
}
