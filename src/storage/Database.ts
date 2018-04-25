'use strict'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/skip'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/switch'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { forEach } from '../utils/index'
import Data from './Map'
import Model from './Model'
import Collection from './Collection'
import { ISchema, bloodyParentMap, Schema } from '../schemas/schema'

export default class DataBase {
  /**
   * 存储所有的数据，以唯一的 key 为索引
   */
  public static data: Map<string, any> = Data

  /**
   * 用来索引 schemaName -> collection names 映射
   */
  private _schemaMap = new Map<string, string[]>()

  constructor() {
    DataBase.data.clear()
  }

  storeOne<T>(data: Schema<T> & T | T, unionFlag = '_id'): Observable<T> {
    const index = data[unionFlag]
    /* istanbul ignore if */
    if (typeof index === 'undefined') {
      return Observable.throw(new Error(`unionFlag not exist in data: ${data}`))
    }
    return Observable.create((observer: Observer<Observable<T>>) => {
      const timer = setTimeout(() => {
        if (typeof data !== 'object' || data === null) {
          return observer.error(new Error(`Can not store an none object data`))
        }
        let cache: Model<T> = DataBase.data.get(index)
        let signal: Observable<T>
        if (cache) {
          signal = this.updateOne<T>(index, data)
            .concatMap(() => cache.get())
        } else {
          cache = new Model(data, unionFlag)
          signal = this._judgeModel(cache)
            .concatMap(() => cache.get())
        }
        // 这里是将存过一次的数据进行标记，表示这个数据已经是完整的了
        // 那些从 Collection 与 Model 解析下来的数据就有可能不是完整的
        if (cache instanceof Schema) {
          if (cache.data instanceof Schema) {
            cache.data.$$keys.clear()
          }
        } else {
          if (!Object.getOwnPropertyDescriptor(cache.data, 'checkSchema')) {
            Object.defineProperty(cache.data, 'checkSchema', {
              get() {
                return () => true
              },
              enumerable: false
            })
          }
        }
        observer.next(signal)
      })
      return () => clearTimeout(timer)
    })
      .concatMap((x: Observable<T>) => x)
  }

  storeCollection<T>(
    index: string,
    data: Array<(T & ISchema) | Schema<T>>,
    schemaName?: string,
    condition?: (data: T) => boolean | Observable<boolean>,
    unionFlag?: string
  ): Observable<T[]> {
    /* istanbul ignore if */
    if (typeof index === 'undefined') {
      return Observable.throw(new Error(`Collection index not exist, data: ${Collection}`))
    }
    return Observable.create((observer: Observer<Observable<(T | Schema<T>)[]>>) => {
      const timer = setTimeout(() => {
        if (!data) {
          return observer.complete()
        }
        const cache: Collection<T> = DataBase.data.get(index)
        if (cache && data.length) {
          const requested = data[0]._requested
          if (requested && requested === cache.requested) {
            return observer.next(cache.get())
            /* istanbul ignore if */
          } else {
            return observer.error(new Error(`Can not store a existed data: ${index}${schemaName ? ' ,schemaName: ' + schemaName : ''}`))
          }
        }
        const collection = new Collection(index, data, schemaName, condition, unionFlag)
        const collections = this._schemaMap.get(schemaName)
        if (schemaName) {
          if (collections) {
            if (collections.indexOf(index) === -1) {
              collections.push(index)
            }
          } else {
            this._schemaMap.set(schemaName, [index])
          }
        }
        observer.next(collection.get())
      })
      return () => clearTimeout(timer)
    })
      .concatMap((x: Observable<T[]>) => x)
  }

  get<T>(index: string): Observable<T> {
    return Observable.create((observer: Observer<Observable<T>>) => {
      const cache = DataBase.data.get(index)
      if (cache) {
        return observer.next(cache.get())
      } else {
        return observer.next(Observable.of(null))
      }
    })
      .concatMap((x: Observable<T>) => x)
  }

  delete(index: string): Observable<void> {
    return Observable.create((observer: Observer<Observable<void>>) => {
      const timer = setTimeout(() => {
        const cache: Model<any> | Collection<any> = DataBase.data.get(index)
        let signal: Observable<any> = Observable.of(false)
        if (cache) {
          if (cache instanceof Model) {
            this._deleteParents(cache)
            const signals = [
              this._deleteChild(cache),
              this._deleteFromCollections(cache)
            ]
            if (bloodyParentMap.has(index)) {
              const bloodyChildren = bloodyParentMap.get(index)
              forEach(bloodyChildren, children => {
                signals.push(this.delete(children))
              })
              bloodyParentMap.delete(index)
            }

            signal = Observable.from(signals)
              .mergeAll()
              .skip(signals.length - 1)
              .map(() => null)
          } else if (cache instanceof Collection) {
            const schemaName = cache.schemaName
            if (schemaName) {
              const collectionName = cache.index
              const collections = this._schemaMap.get(schemaName)
              const pos = collections.indexOf(collectionName)
              collections.splice(pos, 1)
            }
            const models = cache.elements
            forEach(models, _modelName => {
              const model: Model<any> = DataBase.data.get(index)
              model.removeFromCollection(index)
            })
          }
          cache.destroy()
          DataBase.data.delete(index)
        }
        observer.next(signal)
        observer.complete()
      })
      return () => clearTimeout(timer)
    })
      .concatMap((x: Observable<void>) => x)
  }

  updateOne<T>(index: string, patch: any): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      const timer = setTimeout(() => {
        const model: Model<T> = DataBase.data.get(index)
        if (!model) {
          const err = new Error(`Patch target not exist: ${index}`)
          return observer.error(err)
        }
        /* istanbul ignore if */
        if (!(model instanceof Model)) {
          const err = new Error(`Patch target mush be instanceof Model: ${index}`)
          return observer.error(err)
        }
        if (!patch || !Object.keys(patch).length) {
          observer.next(patch)
          return observer.complete()
        }
        model.update(patch)
          .concatMap(x => this._notifySignals(model, x))
          .catch(err => {
            observer.error(err)
            observer.complete()
            return model.get().take(1)
          })
          .forEach(() => {
            observer.next(patch)
            observer.complete()
          })
      })
      return () => clearTimeout(timer)
    })
  }

  updateCollection<T>(index: string, patch: T[]): Observable<T[]>

  /**
   * @param  {string} index 存储索引
   * @param  {T[]} patch  新的列表内容
   * @return Observable<T[]>
   */
  updateCollection<T>(index: string, patch: (T & Schema<T>)[]): Observable<T[]> {
    return Observable.create((observer: Observer<(Schema<T> | T)[]>) => {
      const timer = setTimeout(() => {
        if (!(patch instanceof Array)) {
          return observer.error(new TypeError(`Patch must be Array: ${index}`))
        }
        const collection: Collection<T> = DataBase.data.get(index)
        if (!collection) {
          return observer.error(new TypeError(`Patch target not exist: ${index}`))
        }
        let result: (Schema<T> | T)[]
        collection.update(patch)
          .concatMap(x => {
            result = x
            return collection.notify()
          })
          .catch(err => {
            observer.error(err)
            return collection.get().take(1)
          })
          .forEach(_dest => {
            observer.next(result)
            observer.complete()
          })
      })
      return () => clearTimeout(timer)
    })
  }

  // for test
  flush(): void {
    DataBase.data.clear()
    this._schemaMap.clear()
  }

  checkSchema<T extends Schema<T>>(index: string): boolean {
    const cache: Collection<T> | Model<T> = DataBase.data.get(index)
    if (cache && typeof cache['checkSchema'] !== 'undefined') {
      return cache['checkSchema']()
    } else {
      return false
    }
  }

  private _notifyParents<T>(model: Model<T>): Observable<T> {
    const parents = model.parents
    const signals: Observable<any>[] = []
    const length = parents.length
    if (length) {
      forEach(parents, parent => {
        const parentModel: Model<any> = DataBase.data.get(parent)
        const grandParents = parentModel.parents
        let signal = parentModel.notify()
        if (!(grandParents && grandParents.length && grandParents.indexOf(model.index) !== -1)) {
          signal = signal.concatMap(_result => this._notifyCollections(parentModel))
            .concatMap(_result => this._notifyParents(parentModel))
        }
        signals.push(signal)
      })
      return Observable.from(signals)
        .mergeAll()
        .skip(signals.length - 1)
    }
    return Observable.of(null)
  }

  private _notifyCollections<T>(model: Model<T>): Observable<T[]> {
    const collections = model.collections
    const signals: Observable<T[]>[] = []
    const length = collections.length
    if (length) {
      forEach(collections, collectionName => {
        const collection: Collection<T> = DataBase.data.get(collectionName)
        const signal = collection.judge(model)
          .concatMap(judge => {
            if (!judge) {
              collection.remove(model)
            }
            return collection.notify()
          })
        signals.push(signal)
      })
      return Observable.from(signals)
        .mergeAll()
        .skip(signals.length - 1)
    }
    return Observable.of(null)
  }

  private _judgeModel<T>(model: Model<T>): Observable<T[]> {
    const schemaName = model.getSchemaName()
    const collections = this._schemaMap.get(schemaName)
    const modelCollections = model.collections
    const length = collections ? collections.length : 0
    const judgeSignals: Observable<T[]>[] = []
    if (length) {
      forEach(collections, collectionName => {
        if (modelCollections.indexOf(collectionName) === -1) {
          const collection: Collection<T> = DataBase.data.get(collectionName)
          const judgeSignal = collection.judge(model)
            .concatMap(judge => {
              if (judge) {
                return collection.add(model)
              } else {
                return collection.get().take(1)
              }
            })
          judgeSignals.push(judgeSignal)
        }
      })
      if (judgeSignals.length) {
        return Observable.combineLatest<any>(...judgeSignals)
      }
    }
    return Observable.of(null)
  }

  private _notifySignals<T>(model: Model<T>, _x: T): Observable<any> {
    return Observable.combineLatest(
      model.notify(),
      this._judgeModel(model),
      this._notifyCollections(model),
      this._notifyParents(model)
    )
  }

  private _deleteParents(model: Model<any>): void {
    const children = model.children
    if (children.length) {
      while (children.length) {
        const child = children.pop()
        const childModel: Model<any> = DataBase.data.get(child)
        childModel.removeParent(model.index)
      }
    }
  }

  private _deleteChild(model: Model<any>): Observable<any> {
    const parents = model.parents
    if (parents.length) {
      const signals: Observable<any>[] = []
      while (parents.length) {
        const parent = parents.pop()
        const parentModel: Model<any> = DataBase.data.get(parent)
        parentModel.removeChild(model.index)
        signals.push(parentModel.notify())
      }
      return Observable.from(signals)
        .mergeAll()
        .skip(signals.length - 1)
    }
    return Observable.of(null)
  }

  private _deleteFromCollections(model: Model<any>): Observable<any> {
    const collections = model.collections
    if (collections.length) {
      const signals: Observable<any>[] = []
      while (collections.length) {
        const collectionName = collections.pop()
        const collection: Collection<any> = DataBase.data.get(collectionName)
        if (collection) {
          collection.remove(model)
          signals.push(collection.notify())
        }
      }
      if (signals.length) {
        return Observable.from(signals)
          .mergeAll()
          .skip(signals.length - 1)
      }
    }
    return Observable.of(null)
  }

}
