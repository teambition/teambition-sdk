'use strict'
import {Observable, Observer} from 'rxjs'
import {assign, forEach, clone} from '../utils/index'
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
  private schemaMap = new Map<string, string[]>()

  constructor() {
    Data.clear()
  }

  storeOne <T>(data: T, unionFlag = '_id'): Observable<T> {
    return Observable.create((observer: Observer<Observable<T>>) => {
      setTimeout(() => {
        const index = data[unionFlag]
        const cache = DataBase.data.get(index)
        if (cache) {
          return observer.error(new Error(`can not store a existed data: ${cache.getSchemaName()}, ${index}`))
        }
        const result = new Model(data, unionFlag).signal
        observer.next(result)
      })
    }).concatMap((x: Observable<T>) => x)
  }

  storeCollection <T> (
    index: string,
    data: T[],
    schemaName?: string,
    condition?: (data: T) => boolean,
    unionFlag?: string
  ): Observable<T[]> {
    const cache = DataBase.data.get(index)
    if (cache) {
      return Observable.throw(new Error(`can not store a existed data: ${cache.getSchemaName()}, ${index}`))
    }
    return Observable.create((observer: Observer<Observable<T[]>>) => {
      setTimeout(() => {
        const signal = new Collection(index, data, schemaName, condition, unionFlag).signal
        observer.next(signal)
      })
    }).concatMap((x: Observable<T[]>) => x)
  }

  get<T>(index: string): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      const cache: any = DataBase.data.get(index)
      if (cache) {
        cache.observer = observer
        cache.get().forEach(result => {
          observer.next(result)
        })
      }else {
        observer.next(null)
      }
    })
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
              const collections = this.schemaMap.get(schemaName)
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
    return Observable.create((observer: Observer<Observable<T>>) => {
      setTimeout(() => {
        const model: Model<T> = DataBase.data.get(index)
        if (!model) {
          return observer.error(new Error(`Patch target not exist: ${index}`))
        }
        const notifySignals = (x: T) => {
          return Observable.from([
            this._judgeModel(model),
            this._notifyCollections(model),
            this._notifyParents(model)
          ])
            .mergeAll()
            .skip(2)
            .concatMapTo(Observable.of(x))
        }

        const result = model.update(patch)
          .concatMap(x => notifySignals(x))

        observer.next(result)
      })
    }).concatMap((r: Observable<T>) => r)
  }

  /**
   * @param  {string} index 存储索引
   * @param  {T[]} patch  新的列表内容
   * @return Observable<T[]>
   */
  updateCollection<T>(index: string, patch: T[]): Observable<T[]> {
    if (!(patch instanceof Array)) {
      return Observable.throw(new Error(`Patch must be Array: ${index}`))
    }
    const collection: Collection<T> = DataBase.data.get(index)
    if (!collection) {
      return Observable.throw(new Error(`Patch target Collection not exist: ${index}`))
    }
    return collection.update(patch)
      .concatMap(x => collection.notify())
  }

  exist(index: string): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      setTimeout(() => {
        observer.next(DataBase.data.has(index))
      })
    })
  }

  private _notifyParents<T>(model: Model<T>): Observable<T> {
    const parents = model.parents
    const signals: Observable<any>[] = []
    const length = parents.length
    if (length) {
      forEach(parents, parent => {
        const parentModel: Model<any> = DataBase.data.get(parent)
        const signal = parentModel.get()
          .concatMap(result => this._notifyParentCollections(parentModel, result))
        signals.push(signal)
      })
      return Observable.from(signals)
        .mergeAll()
        .skip(length - 1)
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
            if (judge) {
              return collection.get()
            }else {
              collection.remove(model)
              return Observable.of(null)
            }
          })
          .concatMap(result => collection.notify())
        signals.push(signal)
      })
      return Observable.from(signals)
        .mergeAll()
        .skip(length - 1)
    }
    return Observable.of(null)
  }

  private _judgeModel <T> (model: Model<T>): Observable<T[]> {
    const schemaName = model.getSchemaName()
    const collections = this.schemaMap.get(schemaName)
    const length = collections ? collections.length : 0
    const judgeSignals: Observable<T[]>[] = []
    if (length) {
      forEach(collections, collectionName => {
        const collection: Collection<T> = DataBase.data.get(collectionName)
        const judgeSignal = collection.judge(model)
          .concatMap(judge => {
            if (judge) {
              if (model.collections.indexOf(collectionName) === -1) {
                return collection.add(model)
                  .concatMap(result => collection.notify())
              }
            }
          })
        judgeSignals.push(judgeSignal)
      })
      return Observable.from(judgeSignals)
        .mergeAll()
        .skip(length - 1)
    }
    return Observable.of(null)
  }

  private _notifyParentCollections<T>(parentModel: Model<T>, result: T): Observable<T> {
    return this._notifyCollections(parentModel)
      .concatMap(x => parentModel.notify())
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
        collection.remove(model)
        signals.push(collection.notify())
      })
      return Observable.from(signals)
        .mergeAll()
        .skip(signals.length - 1)
    }
    return Observable.of(null)
  }

}
