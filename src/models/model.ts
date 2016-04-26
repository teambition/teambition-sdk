'use strict'
import * as Rx from 'rxjs'
import DataBase from '../storage/database'

export default class Model {

  public static DataBase = new DataBase()

  protected _save<T>(namespace: string, data: T): Rx.Observable<T> {
    return Model.DataBase.set<T>(namespace, data)
  }

  protected _get<T>(namespace: string): Rx.Observable<T> {
    return Model.DataBase.get<T>(namespace)
  }

  protected _update<T>(namespace: string, patch: any): Rx.Observable<T> {
    return Model.DataBase.exist(namespace)
      .concatMap(x => {
        if (x) return Model.DataBase.update(namespace, patch)
        return Rx.Observable.of(false)
      })
  }

  protected _delete(namespace: string): Rx.Observable<void> {
    return Model.DataBase.delete(namespace)
  }
}
