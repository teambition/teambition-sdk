'use strict'
import Model from './model'
import {IUserMe, IUserEmail} from 'teambition'

export default class UserModel extends Model {

  private namespace = 'user:me'

  set(data: IUserMe): Promise<IUserMe> {
    return this._save(this.namespace, data)
  }

  get(): Promise<IUserMe> {
    return this._get<IUserMe>(this.namespace)
  }

  update(patch: any): Promise<void> {
    return this._update(this.namespace, patch)
  }

  updateEmail(emails: IUserEmail[]): Promise<void> {
    return this._update(this.namespace, {
      emails: emails
    })
  }
}
