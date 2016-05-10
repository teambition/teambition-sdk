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

  /**
   * 列表数据的条件映射
   */
  private conditionsMap = new Map<string, (data: any) => boolean>()

  /**
   * 用来存储 _id -> 父对象 _id 映射
   * 例如 member id 存储着它为 executor 的 task 的 ids
   */
  private parentsMap = new Map<string, string[]>()

  private unionFlag = '_id'

  constructor(unionFlag?: string) {
    if (unionFlag) {
      this.unionFlag = unionFlag
    }
    flushsignals()
  }

  storeOne <T>(index: string, data: T, expire?: number): Rx.Observable<T> {
    if (typeof expire !== 'number') expire = 0
    const result = data
    forEach(data, (value, key) => {
      if (
        typeof value === 'object' &&
        value &&
        value[this.unionFlag]
      ) {
        const thisFlag = value[this.unionFlag]
        const parents = this.parentsMap.get(thisFlag)
        if (parents) {
          if (parents.indexOf(index) === -1) {
            parents.push(index)
          }
        }else {
          this.parentsMap.set(thisFlag, [index])
        }
        this.storeOne(value[this.unionFlag], value, expire)
      }
    })
    this.data.set(index, result)
    this.setExpire(index, expire)
    this.typeIndex.set(index, 'object')
    const destSignal = createNewsignal(index, 'set', result)
      .flatMap(x => [clone(this.data.get(index))])
    this.signalsMap.set(index, destSignal)
    return destSignal
  }

  storeCollection <T> (
    index: string,
    collection: T[],
    condition?: (data: T) => boolean,
    expire?: number
  ): Rx.Observable<T[]> {
    return Rx.Observable.create((observer: Rx.Observer<any>) => {
      setTimeout(() => {
        if (typeof expire !== 'number') expire = 0
        if (this.data.has(index)) return observer.error(new Error('Can not store an existed collection'))
        if (condition) {
          this.conditionsMap.set(index, condition)
        }
        const result = this._storeCollection(index, collection, expire)
        const destSignal = this._mergeCollectionSignals<T>(index, result)
        this.signalsMap.set(index, destSignal)
        observer.next(destSignal)
      })
    }).concatMap((x: Rx.Observable<T>) => x)
  }

  addToCollection<T>(index: string, collectionName: string, data?: T): Rx.Observable<T> {
    const result: T = data ? data : this.data.get(index)
    const action: Rx.Observable<void> = Rx.Observable.create((observer: Rx.Observer<void>) => {
      setTimeout(() => {
        const datamaps = this.dataMaps.get(index)
        if (datamaps) {
          if (datamaps.indexOf(collectionName) === -1) {
            datamaps.push(collectionName)
          }
        }else {
          this.dataMaps.set(index, [collectionName])
        }
        if (this.collectionIndex.has(collectionName)) {
          const collection = this.data.get(collectionName)
          collection.push(result)
          createNewsignal(collectionName, 'set', clone(collection))
          this.collectionIndex.get(collectionName).push(index)
        }else {
          this.collectionIndex.set(collectionName, [index])
        }
      })
      observer.next(null)
    })
    if (data) {
      return action.concatMap(x => {
        return this.storeOne(index, data)
      })
    }else {
      return action.concatMap(x => {
        return Rx.Observable.of(clone(result))
      })
    }
  }

  removeFromCollection(index: string, collectionName: string): Rx.Observable<void> {
    return Rx.Observable.create((observer: Rx.Observer<void>) => {
      setTimeout(() => {
        const datamaps = this.dataMaps.get(index)
        if (datamaps) {
          const pos = datamaps.indexOf(collectionName)
          if (pos !== -1) {
            datamaps.splice(pos, 1)
          }
        }
        if (this.collectionIndex.has(collectionName)) {
          const collectionIndex = this.collectionIndex.get(collectionName)
          const pos = collectionIndex.indexOf(index)
          const collection = this.data.get(collectionName)
          if (pos !== -1) {
            collection.splice(pos, 1)
            createNewsignal(collectionName, 'set', clone(collection))
          }
          if (pos !== -1) {
            collectionIndex.splice(pos, 1)
          }
        }
        observer.next(null)
      })
    })
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
          })
          this._deleteFromMaps(index)
          createNewsignal(index, 'set', null)
          resolve(null)
        })
      })
    }

    return createNewsignal(index, 'delete')
      .concatMap(x => action())
      .flatMap(x => [null])
  }

  updateOne <T>(index: string, patch: any): Rx.Observable<T> {
    const action = () => {
      return new Promise<T>((resolve, reject) => {
        if (typeof patch !== 'object') return reject(new Error('A patch should be Object'))
        setTimeout(() => {
          if (!this.typeIndex.get(index)) return reject(new Error(`Patch target not exist: ${index}`))
          const val = this.data.get(index)
          const expire = patch.expire
          if (typeof expire !== 'undefined') delete patch.expire
          this.setExpire(index, expire)
          this.data.set(index, assign(val, patch))
          this._notifyCollections(index)._notifyParents(index)
          const result = clone(this.data.get(index))
          createNewsignal(index, 'set', result)
          resolve(result)
        })
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
  updateCollection<T>(index: string, patch: T[]): Rx.Observable<T[]> {
    const cache: T[] = this.data.get(index)
    const action = () => {
      return new Promise<T[]>((resolve, reject) => {
        if (!(cache && patch instanceof Array)) return reject(new Error('Patch should be array'))
        setTimeout(() => {
          if (!this.typeIndex.get(index)) return reject(new Error(`Patch target not exist: ${index}`))
          this._updateCollectionEle<T>(index, patch)
          const result = clone(cache)
          createNewsignal(index, 'set', result)
          resolve(result)
        })
      })
    }
    return createNewsignal(index, 'update', cache)
      .concatMap(x => action())
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

  private setExpire(index: string, expire: number) {
    if (!expire) return
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

  private _deleteFromMaps (index: string) {
    this.dataMaps.delete(index)
    this.signalsMap.delete(index)
    this.typeIndex.delete(index)
    this.timeoutIndex.delete(index)
    this.collectionIndex.delete(index)
    this.parentsMap.delete(index)
    this.conditionsMap.delete(index)
  }

  private _storeCollection<T>(index: string, collection: T[], expire?: number) {
    const unionFlag = this.unionFlag
    const result: T[] = []
    const indexes: string[] = []
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
    this.collectionIndex.set(index, indexes)
    return result
  }

  private _updateCollectionEle<T>(index: string, patch: any) {
    const cache: T[] = this.data.get(index)
    const indexs = this.collectionIndex.get(index)
    const newSignals: Rx.Observable<T>[] = []
    const unionFlag = this.unionFlag
    forEach(patch, (val, key) => {
      const oldEle = cache[key]
      if (oldEle && oldEle[unionFlag] === val[unionFlag]) {
        assign(oldEle, val)
      }else {
        const targetId = val[unionFlag]
        if (indexs.indexOf(targetId) === -1) {
          cache.splice(key, 0, val)
          indexs.splice(key, 0, targetId)
          newSignals.push(this.storeOne(val[unionFlag], val))
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
    if (newSignals.length) {
      Rx.Observable.from(newSignals)
        .mergeAll()
        .skip(newSignals.length - 1)
        .subscribe(r => {
          createNewsignal(index, 'set', clone(this.data.get(index)))
        })
    }
    return this
  }

  private _notifyCollections(index: string) {
    const collections = this.dataMaps.get(index)
    if (collections) {
      forEach(collections, collectionName => {
        const collection: any[] = this.data.get(collectionName)
        if (collection) {
          const condition = this.conditionsMap.get(collectionName)
          const originLength = collection.length
          if (condition) {
            forEach(collection, (val, pos) => {
              if (!condition(val)) {
                collection.splice(pos, 1)
              }
            })
          }
          if (collection.length !== originLength) {
            createNewsignal(collectionName, 'set', clone(collection))
          }
        }
      })
    }
    return this
  }

  private _notifyParents(index: string) {
    const parents = this.parentsMap.get(index)
    if (parents) {
      forEach(parents, parent => {
        createNewsignal(parent, 'set', clone(this.data.get(parent)))
      })
    }
    return this
  }

  private _mergeCollectionSignals <T> (index: string, data: T[]): Rx.Observable<T[]> {
    const skipLength = data.length
    const unionFlag = this.unionFlag
    const signals: Rx.Observable<any>[] = data.map(val => this.signalsMap.get(val[unionFlag]))
    signals.push(
      createNewsignal(index, 'set', clone(data))
    )
    return Rx.Observable
      .from(signals)
      .mergeAll()
      .skip(skipLength)
      .concatMap(x => Rx.Observable.of(clone(data)))
  }
}
