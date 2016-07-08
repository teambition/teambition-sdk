'use strict'
import { Observable } from 'rxjs/Observable'
import OrganizationFetch from '../fetchs/OrganizationFetch'
import OrganizationModel from '../models/OrganizationModel'
import { OrganizationData } from '../schemas/Organization'
import { errorHandler, makeColdSignal } from './utils'

export class OrganizationAPI {

  constructor() {
    OrganizationModel.destructor()
  }

  getOrgs(): Observable<OrganizationData[]> {
    return makeColdSignal<OrganizationData[]>(observer => {
      const get = OrganizationModel.getAll()
      if (get) {
        return get
      }
      return Observable.fromPromise(OrganizationFetch.getOrgs())
        .catch(err => errorHandler(observer, err))
        .concatMap(x => OrganizationModel.saveAll(x))
    })
  }

  getOne (organizationId: string): Observable<OrganizationData> {
    return makeColdSignal<OrganizationData>(observer => {
      const get = OrganizationModel.getOne(organizationId)
      if (get) {
        return get
      }
      return Observable.fromPromise(OrganizationFetch.getOne(organizationId))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => OrganizationModel.addOne(x))
    })
  }
}
