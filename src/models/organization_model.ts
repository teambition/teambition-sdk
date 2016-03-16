'use strict'
import Model from './model'
import {OrganizationData} from '../teambition'

export default class OrganizationModel extends Model {
  getAll(): Promise<Array<OrganizationData>> {
    return this._get<OrganizationData[]>('organization')
  }

  get(id: string): Promise<OrganizationData> {
    return this._get<OrganizationData>(id)
  }

  saveAll(organizations: OrganizationData[]): Promise<OrganizationData[]> {
    return this._save<OrganizationData[]>('organization', organizations)
  }

  set(data: OrganizationData): Promise<OrganizationData> {
    return this._save<OrganizationData>(data._id, data)
  }
}
