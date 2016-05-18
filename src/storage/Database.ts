'use strict'
import {Observable, Observer} from 'rxjs'
import {forEach} from '../utils/index'
import Data from './Map'
import Model from './Model'
import Collection from './Collection'

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

  storeOne <T>(data: T, unionFlag = '_id'): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      setTimeout(() => {
        if (typeof data !== 'object' || data === null) {
          return observer.error(new Error(`Can not store an none object data`))
        }
        const index = data[unionFlag]
        const cache: Model<T> = DataBase.data.get(index)
        if (cache) {
          cache.observers.push(observer)
          cache.update(data)
            .concatMap(x => this._judgeModel(cache))
            .concatMap(x => cache.get())
            .forEach(result => observer.next(result))
        }else {
          const model = new Model(data, unionFlag)
          model.observers.push(observer)
          this._judgeModel(model)
            .concatMap(x => model.get())
            .forEach(result => observer.next(result))
        }
      })
    })
  }

  storeCollection <T> (
    index: string,
    data: T[],
    schemaName?: string,
    condition?: (data: T) => boolean,
    unionFlag?: string
  ): Observable<T[]> {
    return Observable.create((observer: Observer<T[]>) => {
      setTimeout(() => {
        const cache = DataBase.data.get(index)
        if (cache) {
          return observer.error(new Error(`Can not store a existed data: ${index}${schemaName ? ' ,schemaName: ' + schemaName : ''}`))
        }
        const collection = new Collection(index, data, schemaName, condition, unionFlag)
        const collections = this._schemaMap.get(schemaName)
        if (collections) {
          if (collections.indexOf(index) === -1) {
            collections.push(index)
          }
        }else {
          this._schemaMap.set(schemaName, [index])
        }
        collection.observers.push(observer)
        collection.get().forEach(value => observer.next(value))
      })
    })
  }

  get<T>(index: string): Observable<T> {
    const cache = this._getSignalMap.get(index)
    if (cache) {
      return cache
    }
    const result = Observable.create((observer: Observer<T>) => {
      const cache: any = DataBase.data.get(index)
      if (cache) {
        cache.observers.push(observer)
        observer.next(cache.data)
      }else {
        observer.next(null)
      }
    })
    this._getSignalMap.set(index, result)
    return result
  }

  delete(index: string): Observable<void> {
    return Observable.create((observer: Observer<Observable<void>>) => {
      setTimeout(() => {
        const cache: Model<any> | Collection<any> = DataBase.data.get(index)
        let signal: Observable<any> = Observable.of(null)
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
          DataBase.data.delete(index)
        }
        const notify = cache.destroy().notify()
        const dest = signal.concatMap(x => {
          return notify
        })
        observer.next(dest)
      })
    }).concatMap((x: Observable<void>) => x)
  }

  updateOne <T>(index: string, patch: any): Observable<T> {
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
  updateCollection<T>(index: string, patch: T[]): Observable<T[]> {
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
            if (collection.observers.length) {
              return collection.notify()
            }else {
              return collection.get()
            }
          })
          .forEach(dest => {
            observer.next(result)
          })
      })
    })
  }

  flush() {
    DataBase.data.clear()
    this._schemaMap.clear()
    this._getSignalMap.clear()
  }

  private _notifyParents<T>(model: Model<T>): Observable<T> {
    const parents = model.parents
    const signals: Observable<any>[] = []
    const length = parents.length
    if (length) {
      forEach(parents, parent => {
        const parentModel: Model<any> = DataBase.data.get(parent)
        const signal = parentModel.get()
          .concatMap(result => this._notifyParentCollections(parentModel))
          .concatMap(result => this._notifyParents(parentModel))
        signals.push(signal)
      })
      return Observable.from(signals)
        .mergeAll()
        .skip(signals.length - 1)
    }
    return Observable.of(null)
  }

  private _notifyCollections <T> (model: Model<T>): Observable<T[]> {
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
            if (collection.observers.length) {
              return collection.notify()
            }else {
              return collection.get()
            }
          })
        signals.push(signal)
      })
      return Observable.from(signals)
        .mergeAll()
        .skip(signals.length - 1)
    }
    return Observable.of(null)
  }

  private _judgeModel <T> (model: Model<T>): Observable<T[]> {
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
                  .concatMap(result => collection.notify())
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

  private _notifyParentCollections<T>(parentModel: Model<T>): Observable<T> {
    return this._notifyCollections(parentModel)
      .concatMap(x => parentModel.notify())
  }

  private _notifySignals <T> (model: Model<T>, x: T): Observable<T> {
    return Observable.from(<any[]>[
      model.notify(),
      this._judgeModel(model),
      this._notifyCollections(model),
      this._notifyParents(model)
    ])
      .mergeAll()
      .skip(3)
      .flatMap((r: T) => Observable.of<T>(x))
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
