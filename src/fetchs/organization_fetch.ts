'use strict'
import BaseFetch from './base'
import {OrganizationData} from '../teambition'

export class OrganizationsFetch extends BaseFetch {

  getOrgs (): Promise<OrganizationData[]> {
    return this.tbFetch.get('/organizations')
  }

  getOne (organizationId: string): Promise<OrganizationData> {
    return this.tbFetch.get(`/organizations/${organizationId}`)
  }
}

export default new OrganizationsFetch()
