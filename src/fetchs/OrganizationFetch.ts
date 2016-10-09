'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { OrganizationData } from '../schemas/Organization'

export class OrganizationFetch extends BaseFetch {

  getOrgs (): Observable<OrganizationData[]> {
    return this.fetch.get('organizations')
  }

  getOne (organizationId: string): Observable<OrganizationData> {
    return this.fetch.get(`organizations/${organizationId}`)
  }
}

export default new OrganizationFetch()
