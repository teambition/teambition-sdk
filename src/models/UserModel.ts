'use strict'
import {Observable} from 'rxjs'
import Model from './BaseModel'
import {UserMe, UserEmail} from '../teambition'

export default class UserModel extends Model<UserMe> {

  private namespace: string

  set(data: UserMe): Observable<UserMe> {
    this.namespace = data._id
    return this._save(data)
  }

  get(): Observable<UserMe> {
    if (!this.namespace) return
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
