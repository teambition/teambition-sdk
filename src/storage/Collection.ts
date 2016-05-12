'use strict'
import {Observer, Observable} from 'rxjs'
import Data from './Map'
import Model from './Model'
import {forEach, clone} from '../utils/index'

export default class Collection <T> {
  public elements: string[] = []
  public signal: Observable<T[]>

  public observer: Observer<T[]>

  constructor(
    public index: string,
    private _data: T[],
    public schemaName?: string,
    public condition?: (data: T) => boolean,
    private _unionFlag = '_id',
    private _expire?: number
  ) {
    if (_data.length) {
      forEach(_data, ele => {
        const _index = ele[_unionFlag]
        const cache: Model<T> = Data.get(_index)
        if (cache) {
          cache.addToCollection(index)
        }else {
          const model = new Model(ele, _unionFlag)
          model.addToCollection(index)
        }
      })
    }
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
        if (!this.observer) {
          observer.error(new Error('Set Collection.observer before notify'))
        }
        const result = clone(this._data)
        this.observer.next(result)
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
          this._data.push(x)
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
            }else {
              if (cache) {
                signals.push(cache.update(ele))
              }else {
                const model = new Model(ele, this._unionFlag)
                signals.push(model.signal)
              }
            }
            this._data.splice(position, 0, ele)
            this.elements.splice(position, 0, index)
          })
          const dist = this._data.length - patch.length
          if (dist > 0) {
            for(let i = 0; i < dist; i ++) {
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
    if (this.condition) {
      return model.get()
        .concatMap(data => Observable.of(this.condition(data)))
    } else {
      return Observable.of(true)
    }
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
      this.elements = []
    })
    return this
  }

}

