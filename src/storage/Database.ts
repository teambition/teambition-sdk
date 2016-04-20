'use strict'
import * as Rx from 'rxjs'
import {assign, forEach, clone} from '../utils/index'
import {createNewsignal} from './signals'

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

  private signalsMap = new Map<string, Rx.Observable<any>>()

  private unionFlag = '_id'

  private types = ['set', 'update', 'delete']

  constructor(unionFlag?: string) {
    if (unionFlag) this.unionFlag = unionFlag
  }

  set<T>(index: string, data: any, expire?: number): Rx.Observable<T> {
    if (typeof expire !== 'number') expire = 0
    if (data instanceof Array && data[0] && data[0][this.unionFlag]) {
      return this.storeCollection(index, data, expire).timeout(0)
    }else {
      return this.storeOne<T>(index, data, expire).timeout(0)
    }
  }

  get<T>(index: string): Rx.Observable<T> {
    const dest = this.signalsMap.get(index)
    if (!dest) return Rx.Observable.empty<T>()
    return dest
  }

  delete(index: string): Rx.Observable<any> {
    const action = new Promise<void>(resolve => {
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

    return createNewsignal(index, 'delete')
      .combineLatest(action)
      .flatMap(x => [null])
  }

  update<T, U>(index: string, patch: T | Array<U>): Rx.Observable<any> {
    const objectType = this.typeIndex.get(index)
    if (!objectType) return Rx.Observable.empty()
    if (objectType === 'object') return this.updateOne(index, patch)
    if (objectType === 'collection') return this.updateCollection(index, <Array<U>>patch)
  }

  exist(index: string): Promise<boolean> {
    return Rx.Observable.create((observer: Rx.Observer<boolean>) => {
      observer.next(this.data.has(index))
    })
  }

  private storeOne <T>(index: string, data: T, expire?: number): Rx.Observable<T> {
    if (typeof expire !== 'number') expire = 0
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
    this.typeIndex.set(index, 'object')
    const destSignal = this._createAllTypesSignals<T>(index, data)
    this.signalsMap.set(index, destSignal)
    return destSignal
  }

  private storeCollection <T extends Array<any>> (index: string, collection: T, expire?: number) {
    if (typeof expire !== 'number') expire = 0
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
    this.typeIndex.set(index, 'collection')
    const destSignal = this._mergeCollectionSignals(index, collection)
    this.signalsMap.set(index, destSignal)
    return destSignal
  }

  private setExpire(index: string, expire: number) {
    if (!(expire && typeof expire === 'number')) return
    const timer = this.timeoutIndex.has(index) ? this.timeoutIndex.get(index).timer : undefined
    if (typeof timer !== 'undefined') {
      clearTimeout(timer)
    }
    const timeoutIndex = setTimeout(() => {
      this.delete(index)
    }, expire)
    this.timeoutIndex.set(index, {
      timer: timeoutIndex,
      begin: Date.now(),
      expire: expire
    })
  }

  private updateOne (index: string, patch: any) {
    const action = new Promise<void>((resolve, reject) => {
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
    return createNewsignal(index, 'update', patch)
      .combineLatest(action)
      .flatMap(x => {
        return x.splice(0, 1)
      })
  }

  /**
   * @param  {string} index 存储索引
   * @param  {T[]} patch  新的列表内容
   * @return void
   */
  private updateCollection<T extends Array<any>>(index: string, patch: T): Rx.Observable<T> {
    const cache: T = this.data.get(index)
    const action = () => {
      return new Promise<T>(resolve => {
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
    return createNewsignal(index, 'update', cache)
      .combineLatest(action())
      .flatMap(x => x.splice(0, 1))
  }

  private _createAllTypesSignals <T> (_id: string, data: any): Rx.Observable<T> {
    return Rx.Observable
      .from(this.types.map(t => {
        if (t !== 'set') return createNewsignal<T>(_id, <any>t)
        return createNewsignal<T>(_id, <any>t, data)
      }))
      .concatAll()
      .flatMap(x => [this.data.get(_id)])
  }

  private _mergeCollectionSignals <T extends Array<any>> (index: string, data: T): Rx.Observable<T> {
    return Rx.Observable
      .from(data.map(val => this._createAllTypesSignals<T>(val[this.unionFlag], val)))
      .concatAll()
      .combineLatest(x => data)
  }
}
