'use strict'
import BaseAPI from './base_api'
import OrganizationModel from '../models/organization_model'
import {IOrganizationData} from 'teambition'

export class OrganizationsAPI extends BaseAPI {

  private OrganizationModel = new OrganizationModel()

  getOrgs (): Promise<IOrganizationData[]> {
    return this.OrganizationModel.getAll()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'organizations'
      }).then((organizations: IOrganizationData[]) => {
        return this.OrganizationModel.saveAll(organizations)
      })
    })
  }

  getOne (organizationId: string): Promise<IOrganizationData> {
    return this.OrganizationModel.get(organizationId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'organizations',
        Id: organizationId
      })
      .then((organization: IOrganizationData) => {
        return this.OrganizationModel.set(organization)
      })
    })
  }
}
