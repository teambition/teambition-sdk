'use strict'
import DataBase from './DataBase'

export default class Model {
  protected setOne(namespace: string, data: any) {
    DataBase.storeOne(namespace, data)
    return DataBase.getOne(namespace)
  }

  protected setCollection(namespace: string, data: any[]) {
    DataBase.storeCollection(namespace, data)
    return DataBase.getOne(namespace)
  }

  protected getOne<T>(namespace: string) {
    return DataBase.getOne<T>(namespace)
  }

  protected updateOne(namespace: string, patch) {
    const Cache = DataBase.getOne(namespace)
    if (Cache) {
      DataBase.updateOne(namespace, patch)
    }
  }

  protected removeOne(namespace: string) {
    return DataBase
  }
}
