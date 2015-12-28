import Model from './BaseModel'
import {IUserMe} from 'teambition'

class UserModel extends Model {

  private namespace = 'user:me'

  set(data: IUserMe): IUserMe {
    return this.setOne(this.namespace, data)
  }

  get(): IUserMe {
    return this.getOne(this.namespace)
  }

  update(patch: any): void {
    this.updateOne(this.namespace, patch)
  }
}

export const userModel = new UserModel()
