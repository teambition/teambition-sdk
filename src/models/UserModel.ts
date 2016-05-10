'use strict'
import {Observable} from 'rxjs'
import Model from './model'
import {UserMe, UserEmail} from '../teambition'

export class UserModel extends Model<UserMe> {

  private namespace = 'user:me'

  set(data: UserMe): Observable<UserMe> {
    return this._save(this.namespace, data)
  }

  get(): Observable<UserMe> {
    return this._get<UserMe>(this.namespace)
  }

  update(patch: any): Observable<any> {
    return this._update<any>(this.namespace, patch)
  }

  updateEmail(emails: UserEmail[]): Observable<any> {
    return this._update(this.namespace, {
      emails: emails
    })
  }
}

export default new UserModel()
