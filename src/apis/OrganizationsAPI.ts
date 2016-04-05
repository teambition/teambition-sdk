'use strict'
import {OrganizationFetch} from '../fetchs/OrganizationFetch'
import OrganizationModel from '../models/OrganizationModel'
import {OrganizationData} from '../teambition'

const organizationFetch = new OrganizationFetch()

export class OrganizationsAPI {

  public static OrganizationModel = new OrganizationModel()

  getOrgs (): Promise<OrganizationData[]> {
    return OrganizationsAPI.OrganizationModel.getAll()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return organizationFetch
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
      return organizationFetch
        .getOne(organizationId)
        .then((organization: OrganizationData) => {
          return OrganizationsAPI.OrganizationModel.set(organization)
        })
    })
  }
}
