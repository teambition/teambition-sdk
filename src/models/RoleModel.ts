'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import DefaultRoleSchema, { DefaultRoleData } from '../schemas/DefaultRole'
import CustomRoleSchema, { CustomRoleData } from '../schemas/CustomRole'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { OrganizationId, CustomRoleId } from '../teambition'

export class RoleModel extends BaseModel {
  private _schemaName = 'Role'

  addDefault(roles: DefaultRoleData[]): Observable<DefaultRoleData[]> {
    const result = datasToSchemas<DefaultRoleData>(roles, DefaultRoleSchema)
    return this._saveCollection<DefaultRoleData>('defaultRoles', result, this._schemaName)
  }

  getDefault(): Observable<DefaultRoleData[]> {
    return this._get<DefaultRoleData[]>('defaultRoles')
  }

  addRoles(organizationId: OrganizationId, roles: CustomRoleData[]): Observable<CustomRoleData[]> {
    const result = datasToSchemas<CustomRoleData>(roles, CustomRoleSchema)
    const dbIndex = `organization:customRoles/${organizationId}`
    return this._saveCollection<CustomRoleData>(dbIndex, result, this._schemaName, data => {
      return data._organizationId === organizationId
    })
  }

  getRoles(organizationId: OrganizationId): Observable<CustomRoleData[]> {
    return this._get<CustomRoleData[]>(`organization:customRoles/${organizationId}`)
  }

  addOne(role: CustomRoleData): Observable<CustomRoleData> {
    const result = dataToSchema<CustomRoleData>(role, CustomRoleSchema)
    return this._save(result)
  }

  getOne(roleId: CustomRoleId): Observable<CustomRoleData> {
    return this._get<CustomRoleData>(<any>roleId)
  }
}

export default new RoleModel()
