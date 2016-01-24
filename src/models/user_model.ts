'use strict'
import Model from './model'
import {IUserMe, IUserEmail} from 'teambition'

class UserModel extends Model {

  private namespace = 'user:me'

  set(data: IUserMe): IUserMe {
    return this.setOne(this.namespace, data)
  }

  get(): IUserMe {
    return this.getOne<IUserMe>(this.namespace)
  }

  update(patch: any): void {
    this.updateOne(this.namespace, patch)
  }

  updateEmail(emails: IUserEmail[]) {
    this.updateOne(this.namespace, {
      emails: emails
    })
  }
}

export default new UserModel()
