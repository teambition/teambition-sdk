'use strict'
import Model from './model'
import {UserMe, UserEmail} from '../teambition'

export default class UserModel extends Model {

  private namespace = 'user:me'

  set(data: UserMe): Promise<UserMe> {
    return this._save(this.namespace, data)
  }

  get(): Promise<UserMe> {
    return this._get<UserMe>(this.namespace)
  }

  update(patch: any): Promise<void> {
    return this._update(this.namespace, patch)
  }

  updateEmail(emails: UserEmail[]): Promise<void> {
    return this._update(this.namespace, {
      emails: emails
    })
  }
}
