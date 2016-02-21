'use strict'
import Model from './model'
import {IOrganizationData} from 'teambition'

export default class OrganizationModel extends Model {
  getAll(): Promise<Array<IOrganizationData>> {
    return this._get<IOrganizationData[]>('organization')
  }

  get(id: string): Promise<IOrganizationData> {
    return this._get<IOrganizationData>(id)
  }

  saveAll(organizations: IOrganizationData[]): Promise<IOrganizationData[]> {
    return this._save<IOrganizationData[]>('organization', organizations)
  }

  set(data: IOrganizationData): Promise<IOrganizationData> {
    return this._save<IOrganizationData>(data._id, data)
  }
}
