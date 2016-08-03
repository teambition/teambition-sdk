'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import DefaultRoleSchema, { DefaultRoleData } from '../schemas/DefaultRole'
import CustomRoleSchema, { CustomRoleData } from '../schemas/CustomRole'
import { datasToSchemas, dataToSchema } from '../utils/index'

export class RoleModel extends BaseModel {
  private _schemaName = 'Role'

  addDefault(roles: DefaultRoleData[]): Observable<DefaultRoleData[]> {
    const result = datasToSchemas<DefaultRoleData>(roles, DefaultRoleSchema)
    return this._saveCollection<DefaultRoleData>('defaultRoles', result, this._schemaName)
  }

  getDefault(): Observable<DefaultRoleData[]> {
    return this._get<DefaultRoleData[]>('defaultRoles')
  }

  addRoles(organizationId: string, roles: CustomRoleData[]): Observable<CustomRoleData[]> {
    const result = datasToSchemas<CustomRoleData>(roles, CustomRoleSchema)
    return this._saveCollection<CustomRoleData>(`organization:customRoles/${organizationId}`, result, this._schemaName, data => {
      return data._organizationId === organizationId
    })
  }

  getRoles(organizationId: string): Observable<CustomRoleData[]> {
    return this._get<CustomRoleData[]>(`organization:customRoles/${organizationId}`)
  }

  addOne(role: CustomRoleData): Observable<CustomRoleData> {
    const result = dataToSchema<CustomRoleData>(role, CustomRoleSchema)
    return this._save(result)
  }

  getOne(roleId: string): Observable<CustomRoleData> {
    return this._get<CustomRoleData>(roleId)
  }
}

export default new RoleModel()
