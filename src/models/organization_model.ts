'use strict'
import Model from './model'
import {IOrganizationData} from 'teambition'

export default class OrganizationModel extends Model {
  getAll(): Array<IOrganizationData> {
    return this._get<IOrganizationData[]>('organization')
  }

  get(id: string): IOrganizationData {
    return this._get<IOrganizationData>(id)
  }

  saveAll(organizations: IOrganizationData[]): IOrganizationData[] {
    return this._save<IOrganizationData[]>('organization', organizations)
  }

  set(data: IOrganizationData): IOrganizationData {
    return this._save<IOrganizationData>(data._id, data)
  }
}
