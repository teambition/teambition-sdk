'use strict'
import { Observable } from 'rxjs/Observable'
import OrganizationFetch from '../fetchs/OrganizationFetch'
import OrganizationModel from '../models/OrganizationModel'
import { OrganizationData } from '../schemas/Organization'
import { makeColdSignal } from './utils'
import { OrganizationId } from '../teambition'

export class OrganizationAPI {

  getOrgs(): Observable<OrganizationData[]> {
    return makeColdSignal<OrganizationData[]>(() => {
      const get = OrganizationModel.getAll()
      if (get) {
        return get
      }
      return OrganizationFetch.getOrgs()
        .concatMap(x =>
          OrganizationModel.saveAll(x)
        )
    })
  }

  getOne (organizationId: OrganizationId): Observable<OrganizationData> {
    return makeColdSignal<OrganizationData>(() => {
      const get = OrganizationModel.getOne(organizationId)
      if (get && OrganizationModel.checkSchema(<string>organizationId)) {
        return get
      }
      return OrganizationFetch.getOne(organizationId)
        .concatMap(x =>
          OrganizationModel.addOne(x)
        )
    })
  }
}

export default new OrganizationAPI
