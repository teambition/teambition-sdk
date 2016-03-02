'use strict'
import {assign, forEach} from '../utils'
import {trackObject, trackOne, trackCollection} from '../utils/track'
import {BaseObject} from './union_object'

export default class DataBase {
  /**
   * 存储所有的数据，以唯一的 key 为索引
   */
  private data = new Map<string, any>()

  /**
   * 时间缓存，控制缓存失效
   */
  private timeoutIndex = new Map<string, {
    timer: any
    begin: number
    expire: number
  }>()

  /**
   * 用来存储一个数据类型
   * 比如可以通过 taskid 获取它索引的是 object 类型的数据
   * 通过 tasklist:${tasklistid}:tasks 获取它是 collection 类型的数据
   */
  private typeIndex = new Map<string, string>()

  /**
   * 用来存储列表索引
   * tasklists:${tasklistid}:tasks 这种
   */
  private collectionIndex = new Map<string, string[]>()

  /**
   * 用来存储数据 -> 列表映射
   * 比如通过一个 taskid 可以知道它分别存储在
   * tasklists, my:recent:tasks, my:today:tasks 等几个列表中
   */
  private dataMaps = new Map<string, string[]>()

  constructor(private unionFlag = '_id') {}

  store(index: string, data: any, expire = 0): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        if (data instanceof Array && data[0] && data[0][this.unionFlag]) {
          this.storeCollection(index, data, expire)
          return resolve()
        }else {
          this.storeOne(index, data, expire)
          return resolve()
        }
      })
    })
  }

  getOne<T>(index: string): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = this.data.get(index)
        let result: any
        if (!data) return resolve()
        if (this.typeIndex.get(index) === 'collection') {
          result = []
          Promise.all(data.map(val => {
            this.getOne(val[this.unionFlag])
            .then(obj => {
              result.push(obj)
              trackOne(index, result)
              return resolve(result)
            })
          }))
        }else {
          result = new BaseObject(data)
          trackOne(result[this.unionFlag], result)
          return resolve(result)
        }
      })
    })
  }

  delete(index: string): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        this.data.delete(index)
        const maps = this.dataMaps.get(index)
        if (!(maps && maps.length)) return resolve()
        forEach(maps, (collectionIndex: string) => {
          const indexes = this.collectionIndex.get(collectionIndex)
          const collection = this.data.get(collectionIndex)
          const position = indexes.indexOf(index)
          indexes.splice(position, 1)
          collection.splice(position, 1)
        })
        resolve()
      })
    })
  }

  update<T, U>(index: string, patch: T | Array<U>): Promise<void> {
    const objectType = this.typeIndex.get(index)
    if (!objectType) return Promise.resolve<void>(undefined)
    if (objectType === 'object') return this.updateOne(index, patch)
    if (objectType === 'collection') return this.updateCollection(index, <Array<U>>patch)
  }

  exist(index: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(this.data.has(index))
    })
  }

  private storeOne(index: string, data: any, expire = 0) {
    const result = data
    forEach(data, (value, key) => {
      if (
        typeof value === 'object' &&
        value &&
        value[this.unionFlag]
      ) {
        this.storeOne(value[this.unionFlag], value, expire)
      }
    })
    this.data.set(index, result)
    this.setExpire(index, expire)
    trackObject(result)
    this.typeIndex.set(index, 'object')
  }

  private storeCollection(index: string, collection: any[], expire = 0) {
    const indexes = []
    this.collectionIndex.set(index, indexes)
    const unionFlag = this.unionFlag
    if (this.data.has(index)) return
    const result = []
    forEach(collection, (val, key) => {
      const cache = this.data.get(val[unionFlag])
      if (cache) {
        result.push(assign(cache, val))
      }else {
        result.push(val)
        this.storeOne(val[unionFlag], val)
      }
      const maps = this.dataMaps.get(val[unionFlag])
      if (maps) {
        maps.push(index)
      }else {
        this.dataMaps.set(val[unionFlag], [index])
      }
      indexes.push(val[unionFlag])
    })
    this.data.set(index, result)
    this.setExpire(index, expire)
    trackCollection(index, result)
    this.typeIndex.set(index, 'collection')
  }

  private setExpire(index: string, expire: number) {
    if (!(expire && typeof expire === 'number')) return
    const timer = this.timeoutIndex.has(index) ? this.timeoutIndex.get(index).timer : undefined
    if (typeof timer !== 'undefined') {
      clearTimeout(timer)
    }
    let timeoutIndex = setTimeout(() => {
      this.delete(index)
    }, expire)
    this.timeoutIndex.set(index, {
      timer: timeoutIndex,
      begin: Date.now(),
      expire: expire
    })
  }

  private updateOne(index: string, patch: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof patch !== 'object') return reject('A patch should be Object')
      setTimeout(() => {
        const val = this.data.get(index)
        const expire = patch.expire
        if (typeof expire !== 'undefined') delete patch.expire
        this.setExpire(index, expire)
        this.data.set(index, assign(val, patch))
        resolve()
      })
    })
  }

  /**
   * @param  {string} index 存储索引
   * @param  {T[]} patch  新的列表内容
   * @return void
   */
  private updateCollection<T>(index: string, patch: T[]): Promise<void> {
    return new Promise<void>(resolve => {
      const cache: T[] = this.data.get(index)
      const unionFlag = this.unionFlag
      if (!(cache && patch instanceof Array)) return resolve()
      setTimeout(() => {
        const indexs = this.collectionIndex.get(index)
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
        resolve()
      })
    })
  }
}
