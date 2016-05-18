'use strict'
import {Observable} from 'rxjs'
import Model from './BaseModel'
import {OrganizationData} from '../teambition'

export class OrganizationModel extends Model {
  getAll(): Observable<Array<OrganizationData>> {
    return this._get<OrganizationData[]>('organization')
  }

  get(id: string): Observable<OrganizationData> {
    return this._get<OrganizationData>(id)
  }

  saveAll(organizations: OrganizationData[]): Observable<OrganizationData[]> {
    return this._saveCollection<OrganizationData>('organization', organizations)
  }

  set(data: OrganizationData): Observable<OrganizationData> {
    return this._save<OrganizationData>(data)
  }
}

export default new OrganizationModel()
