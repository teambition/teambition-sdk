'use strict'
import * as Rx from 'rxjs'
import DataBase from '../storage/Database'

export default class Model<T> {

  public static DataBase = new DataBase()

  public exist (namespace: string): Rx.Observable<boolean> {
    return Model.DataBase.exist(namespace)
  }

  protected _save<T>(namespace: string, data: T): Rx.Observable<T> {
    return Model.DataBase.storeOne<T>(namespace, data)
  }

  protected _saveCollection<T>(
    namespace: string,
    data: T[],
    condition?: (data: T) => boolean
  ): Rx.Observable<T[]> {
    return Model.DataBase.storeCollection(namespace, data, condition)
  }

  protected _saveToCollection<T>(index: string, collectionName: string, data?: T): Rx.Observable<T> {
    return Model.DataBase.addToCollection(index, collectionName, data)
  }

  protected _removeFromCollection(index: string, collectionName: string): Rx.Observable<void> {
    return Model.DataBase.removeFromCollection(index, collectionName)
  }

  protected _get<T>(namespace: string): Rx.Observable<T> {
    return Model.DataBase.get<T>(namespace)
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
