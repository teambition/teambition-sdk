'use strict'
import {Observable, Observer} from 'rxjs'
import Data from './Map'
import {forEach, assign, clone} from '../utils/index'

export default class Model<T> {
  public collections: string[] = []
  public parents: string[] = []
  public children: string[] = []
  public signal: Observable<T>
  public index: string
  public observers: Observer<T>[] = []

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
    this.signal = this.get()
    Data.set(index, this)
  }

  get(): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      setTimeout(() => {
        const result = clone(this.data)
        observer.next(result)
      })
    })
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
        if (this.observers.length) {
          forEach(this.observers, observer => {
            observer.next(result)
          })
        }
        observer.next(result)
      })
    })
  }

  getSchemaName(): string {
    if (this.data && typeof this.data['getSchemaName'] === 'function') {
      return this.data['getSchemaName']()
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
    return this
  }

}
