'use strict'
import {Observable} from 'rxjs'
import {OrganizationFetch} from '../fetchs/OrganizationFetch'
import OrganizationModel from '../models/OrganizationModel'
import {OrganizationData} from '../teambition'

const organizationFetch = new OrganizationFetch()

export class OrganizationsAPI {

  constructor() {
    OrganizationModel.$destroy()
  }

  getOrgs (): Observable<OrganizationData[]> {
    const get = OrganizationModel.getAll()
    if (get) {
      return get
    }
    return Observable.fromPromise(organizationFetch.getOrgs())
      .concatMap(x => OrganizationModel.saveAll(x))
  }

  getOne (organizationId: string): Observable<OrganizationData> {
    const get = OrganizationModel.get(organizationId)
    if (get) {
      return get
    }
    return Observable.fromPromise(organizationFetch.getOne(organizationId))
      .concatMap(x => OrganizationModel.set(x))
  }
}
