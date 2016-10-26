'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import Data from './Map'
import {
  forEach,
  assign,
  clone,
  diffEle,
  dataToSchema,
  capitalizeFirstLetter
} from '../utils/index'
import { ISchema, Schema, ChildMap } from '../schemas/schema'
import * as Schemas from '../schemas/schemaFactory'

export default class Model<T extends ISchema> {
  public collections: string[] = []
  public parents: string[] = []
  public children: string[] = []
  public index: string

  private _childIndexes: (string | {
    key: string
    pos: number
  }) [] = []
  private _subject: BehaviorSubject<T>
  private $$children: ChildMap

  constructor(public data: Schema<T> & T | T, private _unionFlag = '_id') {
    const index = this.index = data[this._unionFlag]
    let $$children: ChildMap
    if (data instanceof Schema) {
      $$children = data.$$children
    }
    this.$$children = $$children ? $$children : new Map<any, any>()
    forEach(data, (val: any, key: string) => {
      if (!this.$$children.has(key)) {
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
                } else {
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
            } else {
              const subModel = new Model(val, _unionFlag)
              subModel.addParent(index)
            }
            this.addChildren(flag, route)
          }
        }
      }
    })
    this._genChild(this.$$children)
    this._subject = new BehaviorSubject(this._clone(data))
    Data.set(index, this)
  }

  get(): Observable<T> {
    if (!this._subject.observers.length) {
      this._subject.next(this._clone(this.data))
    }
    return this._subject
  }

  /**
   * 1. normalize path 对象
   * 2. 判断 normalize 后的对象是否存在于缓存中，若存在则更新，若不存在则建立缓存
   */
  update(patch: any): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      const timer = setTimeout(() => {
        if (!patch || typeof patch !== 'object') {
          return observer.error(new Error(`A patch should be Object, patch: ${patch}, type: ${typeof patch}`))
        }
        const _unionFlag = this._unionFlag
        const _finalPatch: any = Object.create(null)
        forEach(patch, (val, key) => {
          if (this.$$children.has(key)) {
            const childMap = this.$$children.get(key)
            if (childMap.type === 'Object') {
              const result = this._genChildEle(val, childMap.unionFlag, childMap.schemaName)
              this.data[key] = result
            } else if (childMap.type === 'Array') {
              const oldVal = this.data[key]
              if (oldVal && !(oldVal instanceof Array)) {
                throw new Error(`Wrong patch type, oldVal is not an Array, but patch is Array`)
              }
              const result: Schema<any>[] = []
              forEach(val, (childEle, pos) => {
                const unionFlag = childEle[childMap.unionFlag]
                const newRoute = { key, pos }
                const posInChildIndexes = this._childIndexes.indexOf(unionFlag)
                if (posInChildIndexes !== -1) {
                  this._childIndexes[posInChildIndexes] = newRoute
                } else {
                  this.addChildren(unionFlag, newRoute)
                }
                result.push(this._genChildEle(childEle, childMap.unionFlag, childMap.schemaName))
              })
              this.data[key] = result
            }
          } else if (val && typeof val === 'object') {
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
                  const cache: Model<any> = Data.get(_flag)
                  const route = {
                    key: key,
                    pos: pos
                  }
                  if (!cache) {
                    const subModel = new Model(ele, _unionFlag)
                    subModel.addParent(this.index)
                    newEle.push(subModel.data)
                  } else {
                    newEle.push(cache.data)
                    cache.addParent(this.index)
                  }
                  this.addChildren(_flag, route)
                } else {
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
              } else {
                _finalPatch[key] = cache.data
                cache.addParent(this.index)
              }
              this.addChildren(flag, route)
            } else {
              _finalPatch[key] = val
            }
          } else {
            _finalPatch[key] = val
          }
        })
        this.data = assign(this.data, _finalPatch)
        const result = this._clone(this.data)
        observer.next(result)
        observer.complete()
      })
      return () => clearTimeout(timer)
    })
  }

  notify(): Observable<T> {
    if (this._subject.observers.length) {
      this._subject.next(this._clone(this.data))
    }
    return this._subject.take(1)
  }

  getSchemaName(): string {
    return this.data.$$schemaName
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

  addParent(parentFlag: string): Model<T> {
    if (this.parents.indexOf(parentFlag) === -1) {
      this.parents.push(parentFlag)
    }
    return this
  }

  removeParent(parentFlag: string): Model<T> {
    const pos = this.parents.indexOf(parentFlag)
    if (pos !== -1) {
      this.parents.splice(pos, 1)
    }
    return this
  }

  addChildren(childFlag: string, route: string | {
    key: string
    pos: number
  }): Model<T> {
    if (this.children.indexOf(childFlag) === -1) {
      this.children.push(childFlag)
      this._childIndexes.push(route)
    }
    return this
  }

  removeChild(childFlag: string): Model<T> {
    const pos = this.children.indexOf(childFlag)
    if (pos !== -1) {
      this.children.splice(pos, 1)
      const route: any = this._childIndexes[pos]
      if (typeof route === 'object') {
        this.data[route.key].splice([route.pos], 1)
      } else {
        delete this.data[route]
      }
      this._childIndexes.splice(pos, 1)
    }
    return this
  }

  checkSchema(): boolean {
    // ref TPLN-287
    if (this.data && typeof this.data['checkSchema'] === 'function') {
      return this.data['checkSchema']()
    } else {
      return false
    }
  }

  destroy(): void {
    this.data = null
    this.parents = []
    this.children = []
    this._childIndexes = []
    this._subject.next(null)
    this._subject.complete()
    this._subject = null
  }

  /**
   * 序列化子对象
   * 有缓存则更新缓存，没有则建立缓存
   */
  private _genChild($$children: ChildMap) {
    this.$$children.forEach((child, key) => {
      const childData = this.data[key]
      if (!childData) {
        return
      }
      switch (child.type) {
        case 'Object':
          const result = this._genChildEle(childData, child.unionFlag, child.schemaName)
          this.data[key] = result
          this.addChildren(childData[child.unionFlag], key)
          break
        case 'Array':
          if (!childData) {
            return
          }
          if (!(childData instanceof Array)) {
            throw new Error(`child type error, expect Array : ${JSON.stringify(childData, null, 2)}`)
          }
          const ArrResult: Schema<any>[] = []
          forEach(childData, (childEle, pos) => {
            ArrResult.push(this._genChildEle(childEle, child.unionFlag, child.schemaName))
            this.addChildren(childEle[child.unionFlag], { key, pos })
          })
          this.data[key] = ArrResult
          break
      }
    })
  }

  /**
   * 生成一个子元素
   */
  private _genChildEle(childData: any, flag: string, schemaName: string): Schema<any> {
    const unionFlag = childData[flag]
    if (!unionFlag) {
      throw new Error(
        `child unionFlag not exist,
        flag: ${flag},
        data : ${JSON.stringify(childData, null, 2)}`
      )
    }
    const cache: Model<any> = Data.get(unionFlag)
    if (cache) {
      if (diffEle(childData, cache.data)) {
        assign(cache.data, childData)
        cache.notify()
          .subscribe()
          .unsubscribe()
      }
      return cache.data
    } else {
      const subModel = new Model(this._schemaFactory(schemaName, childData, flag))
      subModel.addParent(this.index)
      return subModel.data
    }
  }

  private _schemaFactory<U extends Schema<U>>(schemaName: string, data: U, flag: string) {
    return dataToSchema<U>(data, Schemas[`${ capitalizeFirstLetter(schemaName) }Schema`], flag)
  }

  private _clone(obj: any): T {
    let result: T
    if (typeof obj.clone === 'function') {
      result = obj.clone()
    } else {
      result = clone(obj)
    }
    const schemaName = this.getSchemaName()
    result.$$schemaName = schemaName
    return result
  }

}
