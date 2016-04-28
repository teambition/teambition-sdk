'use strict'
import * as Rx from 'rxjs'
import {assign, forEach, clone} from '../utils/index'
import {createNewsignal, flushsignals} from './signals'

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

  constructor(unionFlag?: string) {
    if (unionFlag) this.unionFlag = unionFlag
    flushsignals()
  }

  set<T>(index: string, data: any, expire?: number): Rx.Observable<T> {
    if (typeof expire !== 'number') expire = 0
    if (data instanceof Array) {
      return this.storeCollection(index, data, expire)
    }else {
      return this.storeOne<T>(index, data, expire)
    }
  }

  get<T>(index: string): Rx.Observable<T> {
    return this.signalsMap.get(index)
  }

  delete(index: string): Rx.Observable<any> {
    const action = () => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          this.data.delete(index)
          const maps = this.dataMaps.get(index)
          if (!(maps && maps.length)) return resolve(null)
          forEach(maps, (collectionIndex: string) => {
            const indexes = this.collectionIndex.get(collectionIndex)
            const collection = this.data.get(collectionIndex)
            const position = indexes.indexOf(index)
            indexes.splice(position, 1)
            collection.splice(position, 1)
            createNewsignal(collectionIndex, 'set', this.data.get(collectionIndex))
          })
          this._deleteFromMaps(index)
          resolve(null)
        })
      })
      .then(r => {
        createNewsignal(index, 'set', r)
        return r
      })
    }

    return createNewsignal(index, 'delete')
      .concatMap(x => action())
      .flatMap(x => [null])
  }

  update<T>(index: string, patch: T | Array<T>): Rx.Observable<any> {
    const objectType = this.typeIndex.get(index)
    if (!objectType) return Rx.Observable.throw(new Error('Patch target not exist'))
    if (objectType === 'object') return this.updateOne(index, patch)
    if (objectType === 'collection') return this.updateCollection(index, <Array<T>>patch)
  }

  exist(index: string): Rx.Observable<boolean> {
    return Rx.Observable.create((observer: Rx.Observer<boolean>) => {
      observer.next(this.data.has(index))
    })
  }

  clearAll() {
    this.data.clear()
    this.timeoutIndex.clear()
    this.typeIndex.clear()
    this.collectionIndex.clear()
    this.dataMaps.clear()
    this.signalsMap.clear()
    flushsignals()
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
    const destSignal = createNewsignal(index, 'set', result)
      .flatMap(x => {
        return [clone(this.data.get(index))]
      })
    this.signalsMap.set(index, destSignal)
    return destSignal
  }

  private storeCollection <T extends Array<any>> (index: string, collection: T, expire?: number): Rx.Observable<T> {
    if (typeof expire !== 'number') expire = 0
    const indexes: any[] = []
    const unionFlag = this.unionFlag
    if (this.data.has(index)) return Rx.Observable.throw(new Error('Can not store an existed collection'))
    this.collectionIndex.set(index, indexes)
    const result: T = <any>[]
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
    const destSignal = this._mergeCollectionSignals<T>(index, result)
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
      this.delete(index).subscribe()
    }, expire)
    this.timeoutIndex.set(index, {
      timer: timeoutIndex,
      begin: Date.now(),
      expire: expire
    })
  }

  private updateOne (index: string, patch: any) {
    const action = () => {
      return new Promise<void>((resolve, reject) => {
        if (typeof patch !== 'object') return reject('A patch should be Object')
        setTimeout(() => {
          const val = this.data.get(index)
          const expire = patch.expire
          if (typeof expire !== 'undefined') delete patch.expire
          this.setExpire(index, expire)
          this.data.set(index, assign(val, patch))
          resolve(clone(this.data.get(index)))
        })
      })
      .then(r => {
        createNewsignal(index, 'set', r)
        return r
      })
    }
    return createNewsignal(index, 'update', patch)
      .concatMap(x => Rx.Observable.fromPromise(action()))
  }

  /**
   * @param  {string} index 存储索引
   * @param  {T[]} patch  新的列表内容
   * @return void
   */
  private updateCollection<T extends Array<any>>(index: string, patch: T): Rx.Observable<T> {
    const cache: T = this.data.get(index)
    const action = () => {
      return new Promise<T>((resolve, reject) => {
        const unionFlag = this.unionFlag
        if (!(cache && patch instanceof Array)) return reject('Patch should be array')
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
          resolve(clone(cache))
        })
      })
      .then(r => {
        createNewsignal(index, 'set', r)
        return r
      })
    }
    return createNewsignal(index, 'update', cache)
      .concatMap(x => action())
  }

  private _deleteFromMaps (index: string) {
    this.dataMaps.delete(index)
    this.signalsMap.delete(index)
    this.typeIndex.delete(index)
    this.timeoutIndex.delete(index)
    this.collectionIndex.delete(index)
  }

  private _mergeCollectionSignals <T extends Array<any>> (index: string, data: T): Rx.Observable<T> {
    const skipLength = data.length
    return Rx.Observable
      .from(data.map(val => this.signalsMap.get(val[this.unionFlag])))
      .mergeAll()
      .skip(skipLength - 1)
      .concatMap(x => Rx.Observable.of(clone(data)))
  }
}
