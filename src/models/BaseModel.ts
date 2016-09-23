'use strict'
import { Observable } from 'rxjs/Observable'
import DataBase from '../storage/Database'
import { Schema } from '../schemas/schema'
import Collection from './BaseCollection'

export default class Model {

  public static DataBase = new DataBase()
  public static TeardownLogics = new Set<Function>()

  protected _collections = new Map<string, Collection<any>>()

  constructor() {
    Model.TeardownLogics.add(() => {
      this._collections.clear()
    })
  }

  delete(namespace: string): Observable<void> {
    return Model.DataBase.delete(namespace)
  }

  update<T>(namespace: string, patch: T): Observable<T> {
    if (typeof patch === 'object' && DataBase.data.get(namespace)) {
      return Model.DataBase.updateOne<T>(namespace, patch)
    } else {
      return Observable.of(null)
    }
  }

  checkSchema(index: string): boolean {
    return Model.DataBase.checkSchema(index)
  }

  /**
   * 存储那些不标准的 Schema，这些 Schema 通常没有 _id 字段且后续不需要更新
   * 在获取后删除由于 sdk 导致的冗余字段
   **/
  saveNonstandardSchema<T>(_id: string, data: T): Observable<T> {
    data['_id'] = _id
    return Model.DataBase.storeOne<T>(data)
      .map(r => {
        delete r['_id']
        delete r['_requested']
        return r
      })
  }

  // 获取那些不标准的 Schema，在获取后删除由于 sdk 导致的冗余字段
  getNonstandardSchema<T>(_id: string): Observable<T> {
    return DataBase.data.get(_id) ? Model.DataBase.get<T>(_id)
      .map(r => {
        delete r['_id']
        delete r['_requested']
        return r
      })
    : null
  }

  protected _save<T>(data: Schema<T> & T, unionFlag?: string): Observable<T> {
    return Model.DataBase.storeOne(data, unionFlag)
  }

  protected _saveCollection<T>(
    namespace: string,
    data: Schema<T>[],
    schemaName?: string,
    condition?: (data: T) => boolean,
    unionFlag?: string
  ): Observable<T[]> {
    return Model.DataBase.storeCollection(namespace, data, schemaName, condition, unionFlag)
  }

  protected _get<T>(index: string): Observable<T> {
    return DataBase.data.get(index) ? Model.DataBase.get<T>(index) : null
  }

  protected _updateCollection<T>(namespace: string, patch: any): Observable<T[]> {
    if (DataBase.data.get(namespace)) {
      return Model.DataBase.updateCollection<T>(namespace, patch)
    } else {
      return Observable.of(null)
    }
  }

}
