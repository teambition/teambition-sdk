'use strict'
import DataBase from '../storage/database'

export default class Model {

  private DataBase = new DataBase()

  protected _save<T>(namespace: string, data: T): Promise<T> {
    return this.DataBase.set(namespace, data)
    .then(() => {
      return this.DataBase.get<T>(namespace)
    })
  }

  protected _get<T>(namespace: string): Promise<T> {
    return this.DataBase.get<T>(namespace)
  }

  protected _update(namespace: string, patch: any): Promise<void> {
    return this.DataBase.exist(namespace)
    .then(result => {
      if (result) return this.DataBase.update(namespace, patch)
    })
  }

  protected _delete(namespace: string): Promise<void> {
    return this.DataBase.delete(namespace)
  }
}
