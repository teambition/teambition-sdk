'use strict'
import OrganizationFetch from '../fetchs/organization_fetch'
import OrganizationModel from '../models/organization_model'
import {OrganizationData} from '../teambition'

export class OrganizationsAPI {

  public static OrganizationModel = new OrganizationModel()

  getOrgs (): Promise<OrganizationData[]> {
    return OrganizationsAPI.OrganizationModel.getAll()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return OrganizationFetch
        .getOrgs()
        .then((organizations: OrganizationData[]) => {
          return OrganizationsAPI.OrganizationModel.saveAll(organizations)
        })
    })
  }

  getOne (organizationId: string): Promise<OrganizationData> {
    return OrganizationsAPI.OrganizationModel.get(organizationId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return OrganizationFetch
        .getOne(organizationId)
        .then((organization: OrganizationData) => {
          return OrganizationsAPI.OrganizationModel.set(organization)
        })
    })
  }
}
