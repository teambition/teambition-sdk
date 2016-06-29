'use strict'
import BaseFetch from './BaseFetch'
import Organization from '../schemas/Organization'

export class OrganizationFetch extends BaseFetch {

  getOrgs (): Promise<Organization[]> {
    return this.fetch.get('organizations')
  }

  getOne (organizationId: string): Promise<Organization> {
    return this.fetch.get(`organizations/${organizationId}`)
  }
}

export default new OrganizationFetch()
