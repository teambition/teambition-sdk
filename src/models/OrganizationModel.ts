'use strict'
import Model from './BaseModel'
import {IOrganizationData} from 'teambition'

class OrganizationModel extends Model {
  getAll() {
    return this.getOne('organization')
  }

  getOrganization(id: string) {
    return this.getOne(`organization:${id}`)
  }

  setAll(organizations: IOrganizationData[]) {
    this.setCollection('organization', organizations)
  }

  setOrganization(id: string, data: IOrganizationData) {
    this.setOne(`organization:${id}`, data)
  }
}

export const organizationModel = new OrganizationModel()
