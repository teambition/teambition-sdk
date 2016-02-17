'use strict'
import DataBase from '../storage/database'

export default class Model {

  private DataBase = new DataBase()

  protected _save<T>(namespace: string, data: T): T {
    this.DataBase.store(namespace, data)
    return this.DataBase.getOne<T>(namespace)
  }

  protected _get<T>(namespace: string): T {
    return this.DataBase.getOne<T>(namespace)
  }

  protected _update(namespace: string, patch: any): void {
    if (this.DataBase.exist(namespace)) this.DataBase.update(namespace, patch)
  }

  protected _delete(namespace: string): void {
    return this.DataBase.delete(namespace)
  }
}
