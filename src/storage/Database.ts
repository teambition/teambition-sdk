'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { forEach } from '../utils/index'
import Data from './Map'
import Model from './Model'
import Collection from './Collection'
import { ISchema } from '../schemas/schema'

export default class DataBase {
  /**
   * 存储所有的数据，以唯一的 key 为索引
   */
  public static data = Data

  /**
   * 用来索引 schemaName -> collection names 映射
   */
  private _schemaMap = new Map<string, string[]>()
  private _getSignalMap = new Map<string, Observable<any>>()

  constructor() {
    DataBase.data.clear()
  }

  storeOne <T extends ISchema<T>>(data: T, unionFlag = '_id'): Observable<T> {
    const index = data[unionFlag]
    /* istanbul ignore if */
    if (typeof index === 'undefined') {
      return Observable.throw(new Error(`unionFlag not exist in data: ${data}`))
    }
    const dest: Observable<T> = Observable.create((observer: Observer<Observable<T>>) => {
      setTimeout(() => {
        if (typeof data !== 'object' || data === null) {
          return observer.error(new Error(`Can not store an none object data`))
        }
        const cache: Model<T> = DataBase.data.get(index)
        let signal: Observable<T>
        if (cache) {
          signal = cache.update(data)
            .concatMap(x => this._judgeModel(cache))
            .concatMap(x => cache.get())
        }else {
          const model = new Model(data, unionFlag)
          signal = this._judgeModel(model)
            .concatMap(x => model.get())
        }
        observer.next(signal)
      })
    }).concatMap((x: Observable<T>) => x)
    return dest
  }

  storeCollection <T extends ISchema<T>> (
    index: string,
    data: T[],
    schemaName?: string,
    condition?: (data: T) => boolean,
    unionFlag?: string
  ): Observable<T[]> {
    /* istanbul ignore if */
    if (typeof index === 'undefined') {
      return Observable.throw(new Error(`Collection index not exist, data: ${Collection}`))
    }
    return Observable.create((observer: Observer<Observable<T[]>>) => {
      setTimeout(() => {
        const cache: Collection<T> = DataBase.data.get(index)
        if (cache) {
          const requested = data.length ? data[0]._requested : 0
          if (requested && requested === cache.requested) {
            observer.next(cache.get())
          /* istanbul ignore if */
          }else {
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
          }else {
            this._schemaMap.set(schemaName, [index])
          }
        }
        observer.next(collection.get())
      })
    }).concatMap((x: Observable<T[]>) => x)
  }

  get<T>(index: string): Observable<T> {
    let signal: Observable<T>
    signal = this._getSignalMap.get(index)
    if (!signal) {
      signal = Observable.create((observer: Observer<Observable<T>>) => {
        const cache = DataBase.data.get(index)
        if (cache) {
          observer.next(cache.get())
        }else {
          observer.next(Observable.of(null))
        }
      }).concatMap((x: Observable<T>) => x)
      this._getSignalMap.set(index, signal)
    }
    return signal
  }

  delete(index: string): Observable<void> {
    return Observable.create((observer: Observer<Observable<void>>) => {
      setTimeout(() => {
        const cache: Model<any> | Collection<any> = DataBase.data.get(index)
        let signal: Observable<any> = Observable.of(null)
        let notify: Observable<any> = Observable.of(null)
        if (cache) {
          if (cache instanceof Model) {
            this._deleteParents(cache)

            signal = Observable.from([
              this._deleteChild(cache),
              this._deleteFromCollections(cache)
            ])
              .mergeAll()
              .skip(1)
          }else if (cache instanceof Collection) {
            const schemaName = cache.schemaName
            if (schemaName) {
              const collectionName = cache.index
              const collections = this._schemaMap.get(schemaName)
              const pos = collections.indexOf(collectionName)
              collections.splice(pos, 1)
            }
            const models = cache.elements
            forEach(models, modelName => {
              const model: Model<any> = DataBase.data.get(index)
              model.removeFromCollection(index)
            })
          }
          notify = cache.destroy().notify()
        }
        const dest = signal.concatMap(x => notify)
        DataBase.data.delete(index)
        observer.next(dest)
      })
    }).concatMap((x: Observable<void>) => x)
  }

  updateOne <T extends ISchema<T>>(index: string, patch: any): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      setTimeout(() => {
        const model: Model<T> = DataBase.data.get(index)
        if (!model) {
          const err = new Error(`Patch target not exist: ${index}`)
          return observer.error(err)
        }
        if (!(model instanceof Model)) {
          const err = new Error(`Patch target mush be instanceof Model: ${model.index}`)
          return observer.error(err)
        }
        model.update(patch)
          .concatMap(x => this._notifySignals(model, x))
          .catch(err => {
            observer.error(err)
            return model.get()
          })
          .forEach(result => observer.next(result))
      })
    })
  }

  /**
   * @param  {string} index 存储索引
   * @param  {T[]} patch  新的列表内容
   * @return Observable<T[]>
   */
  updateCollection<T extends ISchema<T>>(index: string, patch: T[]): Observable<T[]> {
    return Observable.create((observer: Observer<T[]>) => {
      setTimeout(() => {
        if (!(patch instanceof Array)) {
          observer.error(new Error(`Patch must be Array: ${index}`))
        }
        const collection: Collection<T> = DataBase.data.get(index)
        let result: T[]
        collection.update(patch)
          .concatMap(x => {
            result = x
            return collection.notify()
          })
          .catch(err => {
            observer.error(err)
            return Observable.of(result)
          })
          .forEach(dest => {
            observer.next(result)
          })
      })
    })
  }

  // for test
  flush(): void {
    DataBase.data.clear()
    this._schemaMap.clear()
    this._getSignalMap.clear()
  }

  checkSchema<T extends ISchema<T>>(index: string): boolean {
    const cache: Collection<T> | Model<T> = DataBase.data.get(index)
    if (cache instanceof Model) {
      return cache.checkSchema()
    }else {
      return false
    }
  }

  private _notifyParents<T extends ISchema<T>>(model: Model<T>): Observable<T> {
    const parents = model.parents
    const signals: Observable<any>[] = []
    const length = parents.length
    if (length) {
      forEach(parents, parent => {
        const parentModel: Model<any> = DataBase.data.get(parent)
        const signal = parentModel.notify()
          .concatMap(result => this._notifyCollections(parentModel))
          .concatMap(result => this._notifyParents(parentModel))
        signals.push(signal)
      })
      return Observable.from(signals)
        .mergeAll()
        .skip(signals.length - 1)
    }
    return Observable.of(null)
  }

  private _notifyCollections <T extends ISchema<T>> (model: Model<T>): Observable<T[]> {
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

  private _judgeModel <T extends ISchema<T>> (model: Model<T>): Observable<T[]> {
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
              }else {
                return collection.get()
              }
            })
          judgeSignals.push(judgeSignal)
        }
      })
      if (judgeSignals.length) {
        return Observable.from(judgeSignals)
          .mergeAll()
          .skip(length - 1)
      }
    }
    return Observable.of(null)
  }

  private _notifySignals <T extends ISchema<T>> (model: Model<T>, x: T): Observable<T> {
    return Observable.from(<any[]>[
      model.notify(),
      this._judgeModel(model),
      this._notifyCollections(model),
      this._notifyParents(model)
    ])
      .mergeAll()
      .skip(3)
  }

  private _deleteParents(model: Model<any>): void {
    const children = model.children
    if (children.length) {
      forEach(children, child => {
        const childModel: Model<any> = DataBase.data.get(child)
        childModel.removeParent(model.index)
      })
    }
  }

  private _deleteChild(model: Model<any>): Observable<any> {
    const parents = model.parents
    if (parents.length) {
      const signals: Observable<any>[] = []
      forEach(parents, parent => {
        const parentModel: Model<any> = DataBase.data.get(parent)
        parentModel.removeChild(model.index)
        signals.push(parentModel.notify())
      })
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
      forEach(collections, collectionName => {
        const collection: Collection<any> = DataBase.data.get(collectionName)
        if (collection) {
          collection.remove(model)
          signals.push(collection.notify())
        }
      })
      if (signals.length) {
        return Observable.from(signals)
          .mergeAll()
          .skip(signals.length - 1)
      }
    }
    return Observable.of(null)
  }

}
