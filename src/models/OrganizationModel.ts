'use strict'
import { Observable } from 'rxjs/Observable'
import Organization, { OrganizationData } from '../schemas/Organization'
import Model from './BaseModel'
import { datasToSchemas, dataToSchema } from '../utils/index'

export class OrganizationModel extends Model {
  getAll(): Observable<Array<OrganizationData>> {
    return this._get<OrganizationData[]>('organization')
  }

  getOne(id: string): Observable<OrganizationData> {
    return this._get<OrganizationData>(id)
  }

  saveAll(organizations: OrganizationData[]): Observable<OrganizationData[]> {
    const result = datasToSchemas<OrganizationData>(organizations, Organization)
    return this._saveCollection<OrganizationData>('organization', result)
  }

  addOne(data: OrganizationData): Observable<OrganizationData> {
    const result = dataToSchema<OrganizationData>(data, Organization)
    return this._save<OrganizationData>(result)
  }
}

export default new OrganizationModel()
