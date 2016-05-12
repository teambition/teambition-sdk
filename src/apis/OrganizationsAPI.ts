'use strict'
import {Observable} from 'rxjs'
import {OrganizationFetch} from '../fetchs/OrganizationFetch'
import OrganizationModel from '../models/OrganizationModel'
import {OrganizationData} from '../teambition'

const organizationFetch = new OrganizationFetch()

export class OrganizationsAPI {

  private OrganizationModel: OrganizationModel

  constructor() {
    this.OrganizationModel = new OrganizationModel()
  }

  getOrgs (): Observable<OrganizationData[]> {
    const get = this.OrganizationModel.getAll()
    if (get) return get
    return Observable.fromPromise(organizationFetch.getOrgs())
      .concatMap(x => this.OrganizationModel.saveAll(x))
  }

  getOne (organizationId: string): Observable<OrganizationData> {
    const get = this.OrganizationModel.get(organizationId)
    if (get) return get
    return Observable.fromPromise(organizationFetch.getOne(organizationId))
      .concatMap(x => this.OrganizationModel.set(x))
  }
}
