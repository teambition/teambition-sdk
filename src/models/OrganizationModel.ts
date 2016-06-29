'use strict'
import { Observable } from 'rxjs'
import Organization from '../schemas/Organization'
import Model from './BaseModel'

export class OrganizationModel extends Model {
  getAll(): Observable<Array<Organization>> {
    return this._get<Organization[]>('organization')
  }

  getOne(id: string): Observable<Organization> {
    return this._get<Organization>(id)
  }

  saveAll(organizations: Organization[]): Observable<Organization[]> {
    return this._saveCollection<Organization>('organization', organizations)
  }

  addOne(data: Organization): Observable<Organization> {
    return this._save<Organization>(data)
  }
}

export default new OrganizationModel()
