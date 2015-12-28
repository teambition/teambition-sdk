'use strict'
import DataBase from './DataBase'

export default class Model {
  protected setOne(namespace: string, data: any) {
    DataBase.storeOne(namespace, data)
    return DataBase.getOne(namespace)
  }

  protected getOne(namespace: string) {
    return DataBase.getOne(namespace)
  }

  protected updateOne(namespace: string, patch) {
    const Cache = DataBase.getOne(namespace)
    if (Cache) {
      DataBase.updateOne(namespace, patch)
    }
  }
}
