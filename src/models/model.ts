'use strict'
import DataBase from './database'

export default class Model {
  protected setOne<T>(namespace: string, data: T): T {
    DataBase.storeOne(namespace, data)
    return DataBase.getOne<T>(namespace)
  }

  protected setCollection<T>(namespace: string, data: T[]): T[] {
    DataBase.storeCollection(namespace, data)
    return DataBase.getOne<T[]>(namespace)
  }

  protected getOne<T>(namespace: string): T {
    return DataBase.getOne<T>(namespace)
  }

  protected updateOne(namespace: string, patch: any): void {
    const Cache = DataBase.getOne(namespace)
    if (Cache) {
      DataBase.updateOne(namespace, patch)
    }
  }

  protected removeOne(namespace: string): void {
    return DataBase.delete(namespace)
  }
}
