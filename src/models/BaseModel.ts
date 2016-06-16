'use strict'
import * as Rx from 'rxjs'
import DataBase from '../storage/Database'

export default class Model {

  public static DataBase = new DataBase()

  delete(namespace: string): Rx.Observable<void> {
    return Model.DataBase.delete(namespace)
  }

  update<T>(namespace: string, patch: any): Rx.Observable<T> {
    if (DataBase.data.get(namespace)) {
      return Model.DataBase.updateOne<T>(namespace, patch)
    }else {
      return Rx.Observable.of(null)
    }
  }

  // 单例 Model， 这个方法由子类继承，清除子类的状态信息，方便测试
  destructor(): void {
    return void 0
  }

  checkSchema(index: string): boolean {
    return Model.DataBase.checkSchema(index)
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

  protected _updateCollection<T>(namespace: string, patch: any): Rx.Observable<T[]> {
    if (DataBase.data.get(namespace)) {
      return Model.DataBase.updateCollection<T>(namespace, patch)
    }else {
      return Rx.Observable.of(null)
    }
  }

}
