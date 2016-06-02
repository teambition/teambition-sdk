'use strict'
import { Observable } from 'rxjs'
import { OrganizationData } from '../teambition'
import Model from './BaseModel'

export class OrganizationModel extends Model {
  getAll(): Observable<Array<OrganizationData>> {
    return this._get<OrganizationData[]>('organization')
  }

  getOne(id: string): Observable<OrganizationData> {
    return this._get<OrganizationData>(id)
  }

  saveAll(organizations: OrganizationData[]): Observable<OrganizationData[]> {
    return this._saveCollection<OrganizationData>('organization', organizations)
  }

  addOne(data: OrganizationData): Observable<OrganizationData> {
    return this._save<OrganizationData>(data)
  }
}

export default new OrganizationModel()
