'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import Model from './BaseModel'
import { forEach, dropEle, concat } from '../utils/index'
import { Schema } from '../schemas/schema'

export default class BaseCollection<T> extends Model {
  protected _data: Map<number, Schema<T>[]>
  protected _pages: number[]

  private _singals = new Map<number, Observable<T[]>>()

  constructor(
    private _schemaName: string,
    private _condition: (data: T) => boolean,
    private _dbIndex: string,
    private _pageLength = 30,
    private _unionFlag = '_id'
  ) {
    super()
    this._data = new Map<number, Schema<T>[]>()
    this._pages = []
  }

  hasPage(page: number): boolean {
    return this._pages.indexOf(page) !== -1
  }

  addPage(page: number, data: Schema<T>[]): Observable<T[]> {
    if (this._singals.has(page)) {
      return this._singals.get(page)
    }
    return Observable.create((observer: Observer<Observable<T[]>>) => {
      let destSignal: Observable<T[]>
      if (this.hasPage(page)) {
        destSignal = this.get(page)
      } else {
        this._data.set(page, data)
        if (!this._pages.length) {
          this._pages.push(page)
        } else {
          forEach(this._pages, (_page, pos) => {
            const nextPage = this._pages[pos + 1]
            if (!nextPage) {
              if (_page < page) {
                this._pages.push(page)
              } else {
                this._pages.unshift(page)
              }
              return false
            } else if (page > _page && page < nextPage) {
              this._pages.splice(pos, 0, page)
              return false
            }
            return true
          })
        }
        const result = this._getAll()
        /**
         * page 默认从1开始
         */
        if (page === 1) {
          // 可发射多次的流
          destSignal = this._saveCollection(this._dbIndex, result, this._schemaName, this._condition, this._unionFlag)
        } else {
          // 只会发射一次
          destSignal = this._updateCollection<T>(this._dbIndex, result)
        }
      }
      if (destSignal) {
        this._singals.set(page, destSignal)
      }
      observer.next(destSignal)
    })
      .concatMap((x: Observable<T[]>) => x)
      .publishReplay()
      .refCount(1)
  }

  get(page?: number): Observable<T[]> {
    if (page) {
      if (this.hasPage(page)) {
        const getSignal = this._get<T[]>(this._dbIndex)
        if (getSignal) {
          return getSignal
            .map(r => {
              const result: T[] = []
              forEach(r, (ele, index) => {
                if (index >= this._pageLength * (page - 1) && index < this._pageLength * page) {
                  result.push(ele)
                }
              })
              return result
            })
        }else {
          return null
        }
      }
    }else {
      return this._get<T[]>(this._dbIndex)
    }
    return null
  }

  deletePage(page: number): void {
    this._data.delete(page)
    dropEle(page, this._pages)
  }

  $destroy(): void {
    this._data = new Map<number, Schema<T>[]>()
    this._pages = []
  }

  private _getAll(): Schema<T>[] {
    const result: Schema<T>[] = []
    forEach(this._pages, page => {
      concat(result, this._data.get(page))
    })
    return result
  }
}
