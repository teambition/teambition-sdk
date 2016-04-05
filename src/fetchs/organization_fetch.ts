'use strict'
import BaseFetch from './base'
import {OrganizationData} from '../teambition'

export class OrganizationsFetch extends BaseFetch {

  getOrgs (): Promise<OrganizationData[]> {
    return this.fetch.get('/organizations')
  }

  getOne (organizationId: string): Promise<OrganizationData> {
    return this.fetch.get(`/organizations/${organizationId}`)
  }
}

export default new OrganizationsFetch()
