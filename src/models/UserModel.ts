'use strict'
import {Observable} from 'rxjs'
import Model from './BaseModel'
import {UserMe, UserEmail} from '../teambition'

export class UserModel extends Model {

  public userId: string

  set(data: UserMe): Observable<UserMe> {
    this.userId = data._id
    return this._save(data)
  }

  get(): Observable<UserMe> {
    if (!this.userId) {
      return
    }
    return this._get<UserMe>(this.userId)
  }

  update(patch: any) {
    return super.update(this.userId, patch)
  }

  updateEmail(emails: UserEmail[]): Observable<any> {
    return super.update<any>(this.userId, {
      emails: emails
    })
  }
}

export default new UserModel()
