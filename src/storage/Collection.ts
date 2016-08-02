'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import Data from './Map'
import Model from './Model'
import { forEach, clone, assign, dropEle } from '../utils/index'
import { ISchema } from '../schemas/schema'

export default class Collection <T extends ISchema<T>> {
  public elements: string[] = []
  public data: T[]
  public requested: number

  private _subject: BehaviorSubject<T[]>

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
      this.requested = _data[0]._requested
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
    this._subject = new BehaviorSubject(result)
    Data.set(index, this)
  }

  get(): Observable<T[]> {
    return this._subject
  }

  notify(): Observable<T[]> {
    this._subject.next(clone(this.data))
    return this._subject.take(1)
  }

  add(model: Model<T>): Observable<T[]> {
    return model.get()
      .take(1)
      .concatMap(x => {
        const flag = x[this._unionFlag]
        if (this.elements.indexOf(flag) === -1) {
          this.requested = x._requested
          this.elements.unshift(flag)
          model.addToCollection(this.index)
          this.data.unshift(model.data)
        }
        return this.notify()
      })
  }

  /**
   * diff 算法
   * 计算 patch 中每一个元素是否已经存在
   * 如果存在则 使用 model.update 更新原有的元素，如果不存在则 new Model
   * 重新按照 patch 的顺序调整原有元素的顺序
   * 检查数据整体长度，如果 patch 长度小于原有数据长度则剪裁掉数据
   */
  update(patch: T[]): Observable<T[]> {
    return Observable.create((observer: Observer<T[]>) => {
      setTimeout(() => {
        const signals: Observable<T>[] = []
        const diff: T[] = []
        if (patch.length) {
          this.requested = patch[patch.length - 1]._requested
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
            .concatMap(x => this.get().take(1))
            .forEach(result => {
              observer.next(clone(diff))
              observer.complete()
            })
        }else {
          forEach(this.data, () => {
            this.data.pop()
            this.elements.pop()
          })
          observer.next([])
          observer.complete()
        }
      })
    })
  }

  judge(model: Model<T>): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      if (typeof this.condition === 'function') {
        model.get()
          .take(1)
          .forEach(data => {
            if (data) {
              observer.next(this.condition(data))
              observer.complete()
            } else {
              observer.next(false)
              observer.complete()
            }
          })
      } else {
        observer.next(true)
        observer.complete()
      }
    })
  }

  remove(model: Model<T>): Collection<T> {
    const flag = model.index
    const pos = this.elements.indexOf(flag)
    if (pos !== -1) {
      this.requested = Date.now()
      this.elements.splice(pos, 1)
      this.data.splice(pos, 1)
      dropEle(this.index, model.collections)
    }
    return this
  }

  destroy(): void {
    forEach(this.data, (ele, pos) => {
      this.data.splice(pos, 1)
    })
    this.requested = 0
    this.elements = []
    this._subject.next(null)
    this._subject.complete()
    this._subject = null
  }

}
