'use strict'
import { Observer, Observable } from 'rxjs'
import Data from './Map'
import Model from './Model'
import { forEach, clone, assign } from '../utils/index'
import { removeObserver } from '../decorators/rx'

export default class Collection <T> {
  public elements: string[] = []
  public data: T[]

  /**
   * @warn
   * memory leak
   */
  private _observers: Observer<T[]>[]  = []

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
          result.push(model.data)
        }
        this.elements.push(_index)
      })
    }
    this.data = result
    Data.set(index, this)
  }

  get(): Observable<T[]> {
    const dest = Observable.create((observer: Observer<T[]>) => {
      setTimeout(() => {
        const result = clone(this.data)
        this._observers.push(observer)
        observer.next(result)
        removeObserver(dest, observer, this._observers)
      })
    })
    return dest
  }

  notify(): Observable<T[]> {
    return Observable.create((observer: Observer<T[]>) => {
      setTimeout(() => {
        const result = clone(this.data)
        if (this._observers.length) {
          forEach(this._observers, obs => {
            obs.next(result)
          })
        }
        observer.next(result)
      })
    })
  }

  add(model: Model<T>): Observable<T[]> {
    return model.get()
      .concatMap(x => {
        const flag = x[this._unionFlag]
        if (this.elements.indexOf(flag) === -1) {
          this.elements.unshift(flag)
          model.addToCollection(this.index)
          this.data.unshift(model.data)
        }
        return this.notify()
      })
  }

  update(patch: T[]): Observable<T[]> {
    return Observable.create((observer: Observer<T[]>) => {
      setTimeout(() => {
        const signals: Observable<T>[] = []
        const diff: T[] = []
        if (patch.length) {
          forEach(patch, (ele, position) => {
            const index = ele[this._unionFlag]
            const cache: Model<T> = Data.get(index)
            const pos = this.elements.indexOf(index)
            if (pos !== -1) {
              signals.push(cache.update(ele))
              this.data.splice(pos, 1)
              this.elements.splice(pos, 1)
              this.data.splice(position, 0, cache.data)
            }else {
              if (cache) {
                signals.push(cache.update(ele))
                this.data.splice(position, 0, cache.data)
                diff.push(cache.data)
              }else {
                const model = new Model(ele, this._unionFlag)
                model.collections.push(this.index)
                signals.push(model.get())
                this.data.splice(position, 0, model.data)
                diff.push(model.data)
              }
            }
            this.elements.splice(position, 0, index)
          })
          const dist = this.data.length - patch.length
          if (dist > 0) {
            for (let i = 0; i < dist; i ++) {
              this.data.pop()
              this.elements.pop()
            }
          }
          Observable.from(signals)
            .mergeAll()
            .skip(signals.length - 1)
            .concatMap(x => this.get())
            .forEach(result => observer.next(clone(diff)))
        }else {
          forEach(this.data, (ele, pos) => {
            this.data.splice(pos, 1)
            this.elements.splice(pos, 1)
          })
          observer.next([])
        }
      })
    })
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
      this.data.splice(pos, 1)
      forEach(model.collections, (collectionName, pos) => {
        if (collectionName === this.index) {
          model.collections.splice(pos, 1)
        }
      })
    }
    return this
  }

  destroy(): Collection<T> {
    forEach(this.data, (ele, pos) => {
      this.data.splice(pos, 1)
    })
    this.elements = []
    return this
  }

}

