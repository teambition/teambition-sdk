'use strict'
import { Observable } from 'rxjs'
import Model from './BaseModel'
import { forEach, dropEle, concat } from '../utils/index'

export default class BaseCollection<T> extends Model {
  private _data: Map<number, T[]>
  private _pages: number[]

  constructor(
    private _schemaName: string,
    private _condition: (data: T) => boolean,
    private _dbIndex: string,
    private _pageLength = 30
  ) {
    super()
    this._data = new Map<number, T[]>()
    this._pages = []
  }

  hasPage(page: number): Boolean {
    return this._pages.indexOf(page) !== -1
  }

  addPage(page: number, data: T[]): Observable<T[]> {
    if (this.hasPage(page)) {
      throw(new Error(`Page exist in ${this}`))
    }
    this._data.set(page, data)
    this._pages.push(page)
    const result = this._getAll()
    if (page === 1) {
      return this._saveCollection(this._dbIndex, result, this._schemaName, this._condition)
    }else {
      return this._updateCollection<T>(this._dbIndex, result)
    }
  }

  get(page?: number) {
    if (page) {
      if (this.hasPage(page)) {
        return this._get<T[]>(this._dbIndex)
          .skip((page - 1) * 30)
          .take(30)
      }
    }else {
      return this._get<T[]>(this._dbIndex)
    }
    return null
  }

  deletePage(page: number) {
    this._data.delete(page)
    dropEle(page, this._pages)
  }

  $destroy() {
    this._data = new Map<number, T[]>()
    this._pages = []
  }

  private _getAll(): T[] {
    const result: T[] = []
    forEach(this._pages, page => {
      concat(result, this._data.get(page))
    })
    return result
  }
}
