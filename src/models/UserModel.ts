'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import { default as User, UserMe } from '../schemas/UserMe'
import { dataToSchema } from '../utils/index'

export class UserModel extends Model {

  public userId: string

  destructor() {
    this.userId = null
  }

  set(data: UserMe): Observable<UserMe> {
    this.userId = data._id
    return this._save(dataToSchema(data, User))
  }

  get(): Observable<UserMe> {
    if (!this.userId) {
      return void 0
    }
    return this._get<UserMe>(this.userId)
  }

  update(patch: any): Observable<any> {
    return super.update(this.userId, patch)
  }

}

export default new UserModel()
