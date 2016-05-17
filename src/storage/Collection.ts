'use strict'
import {Observer, Observable} from 'rxjs'
import Data from './Map'
import Model from './Model'
import {forEach, clone, assign} from '../utils/index'

export default class Collection <T> {
  public elements: string[] = []
  public signal: Observable<T[]>
  public observers: Observer<T[]>[] = []

  private _data: T[]

  constructor(
    public index: string,
    _data: T[],
    public schemaName?: string,
    public condition?: (data: T) => boolean,
    private _unionFlag = '_id',
    private _expire?: number
  ) {
    const result: T[] = []
    if (_data.length) {
      forEach(_data, (ele, pos) => {
        const _index = ele[_unionFlag]
        const cache: Model<T> = Data.get(_index)
        if (cache) {
          cache.addToCollection(index)
          result.push(assign(cache.data, ele))
        }else {
          const model = new Model(ele, _unionFlag)
          model.addToCollection(index)
          result.push(ele)
        }
        this.elements.push(_index)
      })
    }
    this._data = result
    this.signal = this.get()
    Data.set(index, this)
  }

  get(): Observable<T[]> {
    return Observable.create((observer: Observer<T[]>) => {
      setTimeout(() => {
        const result = clone(this._data)
        observer.next(result)
      })
    })
  }

  notify(): Observable<T[]> {
    return Observable.create((observer: Observer<T[]>) => {
      setTimeout(() => {
        if (!this.observers.length) {
          observer.error(new Error(`Set Collection.observer before notify ${this.index}`))
        }
        const result = clone(this._data)
        forEach(this.observers, observer => {
          observer.next(result)
        })
        observer.next(result)
      })
    })
  }

  add(model: Model<T>): Observable<T[]> {
    return model.get()
      .concatMap(x => {
        const flag = x[this._unionFlag]
        if (this.elements.indexOf(flag) === -1) {
          this.elements.push(flag)
          model.collections.push(this.index)
          this._data.push(model.data)
        }
        return this.get()
      })
  }

  update(patch: T[]): Observable<T[]> {
    return Observable.create((observer: Observer<Observable<T[]>>) => {
      setTimeout(() => {
        const signals: Observable<T>[] = []
        if (patch.length) {
          forEach(patch, (ele, position) => {
            const index = ele[this._unionFlag]
            const cache: Model<T> = Data.get(index)
            const pos = this.elements.indexOf(index)
            if (pos !== -1) {
              signals.push(cache.update(ele))
              this._data.splice(pos, 1)
              this.elements.splice(pos, 1)
              this._data.splice(position, 0, ele)
            }else {
              if (cache) {
                signals.push(cache.update(ele))
                this._data.splice(position, 0, cache.data)
              }else {
                const model = new Model(ele, this._unionFlag)
                model.collections.push(this.index)
                signals.push(model.signal)
                this._data.splice(position, 0, ele)
              }
            }
            this.elements.splice(position, 0, index)
          })
          const dist = this._data.length - patch.length
          if (dist > 0) {
            for (let i = 0; i < dist; i ++) {
              this._data.pop()
              this.elements.pop()
            }
          }
          const dest = Observable.from(signals)
            .mergeAll()
            .skip(signals.length - 1)
            .concatMap(x => this.get())
          observer.next(dest)
        }else {
          forEach(this._data, (ele, pos) => {
            this._data.splice(pos, 1)
            this.elements.splice(pos, 1)
          })
          observer.next(this.get())
        }
      })
    }).concatMap((x: Observable<T[]>) => x)
  }

  judge(model: Model<T>): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      if (typeof this.condition === 'function') {
        model.get()
          .forEach(data => observer.next(this.condition(data)))
      } else {
        return observer.next(true)
      }
    })
  }

  remove(model: Model<T>): Collection<T> {
    const flag = model.index
    const pos = this.elements.indexOf(flag)
    if (pos !== -1) {
      this.elements.splice(pos, 1)
      this._data.splice(pos, 1)
      forEach(model.collections, (collectionName, pos) => {
        if (collectionName === this.index) {
          model.collections.splice(pos, 1)
        }
      })
    }
    return this
  }

  destroy(): Collection<T> {
    forEach(this._data, (ele, pos) => {
      this._data.splice(pos, 1)
    })
    this.elements = []
    return this
  }

}

