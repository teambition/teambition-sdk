'use strict'
import BaseAPI from './base_api'
import OrganizationModel from '../models/organization_model'
import {OrganizationData} from '../teambition'

export class OrganizationsAPI extends BaseAPI {

  public static OrganizationModel = new OrganizationModel()

  getOrgs (): Promise<OrganizationData[]> {
    return OrganizationsAPI.OrganizationModel.getAll()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'organizations'
      }).then((organizations: OrganizationData[]) => {
        return OrganizationsAPI.OrganizationModel.saveAll(organizations)
      })
    })
  }

  getOne (organizationId: string): Promise<OrganizationData> {
    return OrganizationsAPI.OrganizationModel.get(organizationId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'organizations',
        Id: organizationId
      })
      .then((organization: OrganizationData) => {
        return OrganizationsAPI.OrganizationModel.set(organization)
      })
    })
  }
}
