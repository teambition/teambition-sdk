'use strict'
import * as Rx from 'rxjs'
import DataBase from '../storage/Database'

export default class Model<T> {

  public static DataBase = new DataBase()

  constructor() {
    Model.DataBase = new DataBase()
  }

  public exist (namespace: string): Rx.Observable<boolean> {
    return Model.DataBase.exist(namespace)
  }

  protected _save<T>(data: T): Rx.Observable<T> {
    return Model.DataBase.storeOne<T>(data)
  }

  protected _saveCollection<T>(
    namespace: string,
    data: T[],
    schemaName?: string,
    condition?: (data: T) => boolean
  ): Rx.Observable<T[]> {
    return Model.DataBase.storeCollection(namespace, data, schemaName, condition)
  }

  protected _get<T>(index: string): Rx.Observable<T> {
    return DataBase.data.get(index) ? Model.DataBase.get<T>(index) : null
  }

  protected _update<T>(namespace: string, patch: any): Rx.Observable<T> {
    return Model.DataBase.updateOne<T>(namespace, patch)
  }

  protected _updateCollection<T>(namespace: string, patch: any): Rx.Observable<T[]> {
    return Model.DataBase.updateCollection<T>(namespace, patch)
  }

  protected _delete(namespace: string): Rx.Observable<void> {
    return Model.DataBase.delete(namespace)
  }
}
