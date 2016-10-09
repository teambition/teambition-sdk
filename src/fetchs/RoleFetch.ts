'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { DefaultRoleData } from '../schemas/DefaultRole'
import { CustomRoleData } from '../schemas/CustomRole'

export class RoleFetch extends BaseFetch {
  getDefaultRoles(): Observable<DefaultRoleData[]> {
    return this.fetch.get('roles')
  }

  getCustomRoles(organizationId: string): Observable<CustomRoleData[]> {
    return this.fetch.get(`organizations/${organizationId}/roles`)
  }

  getOne(roleId: string): Observable<CustomRoleData> {
    return this.fetch.get(`roles/${roleId}`)
  }
}

export default new RoleFetch()
