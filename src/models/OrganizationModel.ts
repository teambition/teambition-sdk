'use strict'
import Model from './BaseModel'
import {IOrganizationData} from 'teambition'

class OrganizationModel extends Model {
  getAll(): Array<IOrganizationData> {
    return this.getOne<IOrganizationData[]>('organization')
  }

  get(id: string): IOrganizationData {
    return this.getOne<IOrganizationData>(id)
  }

  setAll(organizations: IOrganizationData[]): IOrganizationData[] {
    return this.setCollection<IOrganizationData>('organization', organizations)
  }

  set(data: IOrganizationData): IOrganizationData {
    return this.setOne<IOrganizationData>(data._id, data)
  }
}

export default new OrganizationModel()
