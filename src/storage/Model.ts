'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import Data from './Map'
import { forEach, assign, clone } from '../utils/index'
import { Schema, ISchema } from '../schemas/schema'

export default class Model<T extends ISchema<T>> {
  public collections: string[] = []
  public parents: string[] = []
  public children: string[] = []
  public index: string

  private _childIndexes: string[] = []
  private _subject: BehaviorSubject<T>

  constructor(public data: T, private _unionFlag = '_id') {
    const index = this.index = data[this._unionFlag]
    forEach(data, (val: any, key: string) => {
      if (val) {
        const flag = val[_unionFlag]
        if (val instanceof Array && val.length) {
          forEach(val, (ele: any, pos: number) => {
            if (ele && ele[_unionFlag]) {
              const _flag = ele[_unionFlag]
              const cache: Model<any> = Data.get(_flag)
              const route = {
                key: key,
                pos: pos
              }
              if (!cache) {
                const subModel = new Model(ele, _unionFlag)
                subModel.addParent(index)
              }else {
                cache.addParent(index)
                val.splice(pos, 1, cache.data)
              }
              this.addChildren(_flag, route)
            }
          })
        } else if (typeof flag !== 'undefined') {
          const cache: Model<any> = Data.get(flag)
          const route = key
          if (cache) {
            cache.addParent(index)
            data[key] = cache.data
          }else {
            const subModel = new Model(val, _unionFlag)
            subModel.addParent(index)
          }
          this.addChildren(flag, route)
        }
      }
    })
    this._subject = new BehaviorSubject(data)
    Data.set(index, this)
  }

  get(): Observable<T> {
    return this._subject
  }

  /**
   * 1. normalize path 对象
   * 2. 判断 normalize 后的对象是否存在于缓存中，若存在则更新，若不存在则建立缓存
   */
  update(patch: any): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      setTimeout(() => {
        if (!patch || typeof patch !== 'object') {
          return observer.error(new Error(`A patch should be Object, patch: ${patch}, type: ${typeof patch}`))
        }
        const _unionFlag = this._unionFlag
        const _finalPatch: any = Object.create(null)
        forEach(patch, (val, key) => {
          if (val && typeof val === 'object') {
            const flag: string = val[_unionFlag]
            if (val instanceof Array && val.length) {
              const oldVal = this.data[key]
              if (oldVal instanceof Array && oldVal.length) {
                forEach(oldVal, ele => {
                  if (ele && ele[_unionFlag]) {
                    const _flag = ele[_unionFlag]
                    this.removeChild(_flag)
                  }
                })
              }
              const newEle: any[] = _finalPatch[key] = []
              forEach(val, (ele: any, pos: number) => {
                if (ele && ele[_unionFlag]) {
                  const _flag = ele[_unionFlag]
                  if (this.children.indexOf(_flag) === -1) {
                    const cache: Model<any> = Data.get(_flag)
                    const route = {
                      key: key,
                      pos: pos
                    }
                    if (!cache) {
                      const subModel = new Model(ele, _unionFlag)
                      subModel.addParent(this.index)
                      newEle.push(subModel.data)
                    }else {
                      newEle.push(cache.data)
                      cache.addParent(this.index)
                    }
                    this.addChildren(_flag, route)
                  }
                }else {
                  newEle.push(ele)
                }
              })
            } else if (typeof flag !== 'undefined') {
              const cache: Model<any> = Data.get(flag)
              const route = key
              if (!cache) {
                const subModel = new Model(val, _unionFlag)
                subModel.addParent(this.index)
                _finalPatch[key] = subModel.data
              }else {
                _finalPatch[key] = cache.data
                cache.addParent(this.index)
              }
              this.addChildren(flag, route)
            }else {
              _finalPatch[key] = val
            }
          }else {
            _finalPatch[key] = val
          }
        })
        this.data = assign(this.data, _finalPatch)
        const result = clone(this.data)
        observer.next(result)
        observer.complete()
      })
    })
  }

  notify(): Observable<T> {
    this._subject.next(clone(this.data))
    return this._subject.take(1)
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
      this.collections.unshift(collectionName)
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

  checkSchema(): boolean {
    if (this.data && this.data instanceof Schema) {
      return this.data.checkSchema()
    }else {
      return true
    }
  }

  destroy(): Model<T> {
    this.data = null
    this.parents = []
    this.children = []
    this._childIndexes = []
    return this
  }

}
