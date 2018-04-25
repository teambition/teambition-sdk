'use strict'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/publishReplay'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import Model from './BaseModel'
import { forEach, concat } from '../utils/index'
import { Schema } from '../schemas/schema'

export type Page = number | string

export default class BaseCollection<T> extends Model {
  protected _data: Map<Page, Schema<T>[]>
  protected _pages: Page[]

  private _singals = new Map<Page, Observable<T[]>>()

  constructor(
    private _schemaName: string,
    private _condition: (data: T) => boolean,
    private _dbIndex: string,
    private _pageLength = 30,
    private _unionFlag = '_id'
  ) {
    super()
    this._data = new Map<Page, Schema<T>[]>()
    this._pages = []
  }

  hasPage(page: Page): boolean {
    return this._pages.indexOf(page) !== -1
  }

  addPage(page: Page, data: Schema<T>[]): Observable<T[]> {
    if (!data) {
      return Observable.of(null)
    }
    return Observable.create((observer: Observer<Observable<T[]>>) => {
      let destSignal: Observable<T[]>
      if (this.hasPage(page)) {
        if (page === 1) {
          destSignal = this._singals.get(page)
        } else {
          destSignal = this.get(page)
        }
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
            .publishReplay(1)
            .refCount()
        } else {
          // 只会发射一次
          destSignal = this._updateCollection<T>(this._dbIndex, result)
            .publishReplay(1)
            .refCount()
        }
      }
      this._singals.set(page, destSignal)
      observer.next(destSignal)
    })
      ._switch()
  }

  get(page?: Page): Observable<T[]> {
    if (page) {
      if (this.hasPage(page)) {
        if (page !== 1) {
          const getSignal = this._singals.get(page)
          if (getSignal) {
            return getSignal
          } else {
            return null
          }
        } else {
          return this._get<T[]>(this._dbIndex)
        }
      }
    } else {
      return this._get<T[]>(this._dbIndex)
    }
    return null
  }

  private _getAll(): Schema<T>[] {
    const result: Schema<T>[] = []
    forEach(this._pages, page => {
      concat(result, this._data.get(page))
    })
    return result
  }
}
