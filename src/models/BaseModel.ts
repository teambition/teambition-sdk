'use strict'
import { Observable } from 'rxjs/Observable'
import DataBase from '../storage/Database'
import { ISchema } from '../schemas/schema'

export default class Model {

  public static DataBase = new DataBase()

  delete(namespace: string): Observable<void> {
    return Model.DataBase.delete(namespace)
  }

  update<T>(namespace: string, patch: T): Observable<T> {
    if (DataBase.data.get(namespace)) {
      return Model.DataBase.updateOne<T>(namespace, patch)
    }else {
      return Observable.of(null)
    }
  }

  // 单例 Model， 这个方法由子类继承，清除子类的状态信息，方便测试
  destructor(): void {
    return void 0
  }

  checkSchema(index: string): boolean {
    return Model.DataBase.checkSchema(index)
  }

  protected _save<T extends ISchema<T>>(data: T, unionFlag?: string): Observable<T> {
    return Model.DataBase.storeOne<T>(data, unionFlag)
  }

  protected _saveCollection<T extends ISchema<T>>(
    namespace: string,
    data: T[],
    schemaName?: string,
    condition?: (data: T) => boolean,
    unionFlag?: string
  ): Observable<T[]> {
    return Model.DataBase.storeCollection(namespace, data, schemaName, condition, unionFlag)
  }

  protected _get<T>(index: string): Observable<T> {
    return DataBase.data.get(index) ? Model.DataBase.get<T>(index) : null
  }

  protected _updateCollection<T extends ISchema<T>>(namespace: string, patch: any): Observable<T[]> {
    if (DataBase.data.get(namespace)) {
      return Model.DataBase.updateCollection<T>(namespace, patch)
    }else {
      return Observable.of(null)
    }
  }

}
