'use strict'
import Model from './model'
import {IUserMe, IUserEmail} from 'teambition'

export default class UserModel extends Model {

  private namespace = 'user:me'

  set(data: IUserMe): IUserMe {
    return this._save(this.namespace, data)
  }

  get(): IUserMe {
    return this._get<IUserMe>(this.namespace)
  }

  update(patch: any): void {
    this._update(this.namespace, patch)
  }

  updateEmail(emails: IUserEmail[]) {
    this._update(this.namespace, {
      emails: emails
    })
  }
}
