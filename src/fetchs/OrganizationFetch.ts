'use strict'
import BaseFetch from './BaseFetch'
import { OrganizationData } from '../teambition'

export class OrganizationFetch extends BaseFetch {

  getOrgs (): Promise<OrganizationData[]> {
    return this.fetch.get('organizations')
  }

  getOne (organizationId: string): Promise<OrganizationData> {
    return this.fetch.get(`organizations/${organizationId}`)
  }
}

export default new OrganizationFetch()
