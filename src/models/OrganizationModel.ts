'use strict'
import Model from './BaseModel'
import {IOrganizationData} from 'teambition'

class OrganizationModel extends Model {
  getAll() {
    return this.getOne('organization')
  }

  getOne(id: string) {
    return this.getOne(`organization:${id}`)
  }

  setAll(organizations: IOrganizationData[]) {
    this.setCollection('organization', organizations)
  }
}
