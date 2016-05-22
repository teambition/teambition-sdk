'use strict'
import { Observable, Observer } from 'rxjs'
import Data from './Map'
import { forEach, assign, clone } from '../utils/index'
import { removeObserver } from '../decorators/rx'

export default class Model<T> {
  public collections: string[] = []
  public parents: string[] = []
  public children: string[] = []
  public index: string

  /**
   * @warn
   * memory leak
   */
  private _observers: Observer<T>[] = []
  private _childIndexes: string[] = []

  constructor(public data: T, private _unionFlag = '_id') {
    const index = this.index = this.data[this._unionFlag]
    forEach(data, (val: any, key: string) => {
      if (val) {
        const flag = val[_unionFlag]
        if (val instanceof Array && val.length) {
          forEach(val, (ele: any, pos: number) => {
            const _flag = ele[_unionFlag]
            if (_flag) {
              const subModel = new Model(ele, _unionFlag)
              const route = {
                key: key,
                pos: pos
              }
              subModel.addParent(index)
              this.addChildren(_flag, route)
            }
          })
        } else if (typeof flag !== 'undefined') {
          const subModel = new Model(val, _unionFlag)
          const route = key
          subModel.addParent(index)
          this.addChildren(flag, route)
        }
      }
    })
    Data.set(index, this)
  }

  get(): Observable<T> {
    const dest = Observable.create((observer: Observer<T>) => {
      setTimeout(() => {
        const result = clone(this.data)
        this._observers.push(observer)
        observer.next(result)
        removeObserver(dest, observer, this._observers)
      })
    })
    return dest
  }

  update(patch: any): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      setTimeout(() => {
        if (typeof patch !== 'object') {
          return observer.error(new Error('A patch should be Object'))
        }
        this.data = assign(this.data, patch)
        const result = clone(this.data)
        observer.next(result)
      })
    })
  }

  notify(): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
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

  getSchemaName(): string {
    const getSchemaName = this.data['getSchemaName']
    if (this.data && typeof getSchemaName  === 'function') {
      return getSchemaName()
    }else {
      return null
    }
  }

  addToCollection(collectionName: string): Model<T> {
    if (this.collections.indexOf(collectionName) === -1) {
      this.collections.push(collectionName)
    }
    return this
  }

  removeFromCollection(collectionName: string): Model<T> {
    const pos = this.collections.indexOf(collectionName)
    if (pos !== -1) {
      this.collections.splice(pos, 1)
    }
    return this
  }

  addParent(parentIndex: string): Model<T> {
    if (this.parents.indexOf(parentIndex) === -1) {
      this.parents.push(parentIndex)
    }
    return this
  }

  addChildren(childIndex: string, route: any): Model<T> {
    if (this.children.indexOf(childIndex) === -1) {
      this.children.push(childIndex)
      this._childIndexes.push(route)
    }
    return this
  }

  removeParent(parentIndex: string): Model<T> {
    const pos = this.parents.indexOf(parentIndex)
    if (pos !== -1) {
      this.parents.splice(pos, 1)
    }
    return this
  }

  removeChild(childIndex: string): Model<T> {
    const pos = this.children.indexOf(childIndex)
    if (pos !== -1) {
      this.children.splice(pos, 1)
      const route: any = this._childIndexes[pos]
      if (typeof route === 'object') {
        delete this.data[route.key][route.pos]
      }else {
        delete this.data[route]
      }
      this._childIndexes.splice(pos, 1)
    }
    return this
  }

  destroy(): Model<T> {
    this.data = null
    this.parents = []
    this.children = []
    this._childIndexes = []
    return this
  }

}
