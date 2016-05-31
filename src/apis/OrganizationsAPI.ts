'use strict'
import { Observable } from 'rxjs'
import OrganizationFetch from '../fetchs/OrganizationFetch'
import OrganizationModel from '../models/OrganizationModel'
import { OrganizationData } from '../teambition'
import { errorHandler, makeColdSignal } from './utils'

export class OrganizationsAPI {

  constructor() {
    OrganizationModel.destructor()
  }

  getOrgs (): Observable<OrganizationData[]> {
    return makeColdSignal(observer => {
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
    return makeColdSignal(observer => {
      const get = OrganizationModel.get(organizationId)
      if (get) {
        return get
      }
      return Observable.fromPromise(OrganizationFetch.getOne(organizationId))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => OrganizationModel.set(x))
    })
  }
}
