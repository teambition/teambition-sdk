'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { DefaultRoleData } from '../schemas/DefaultRole'
import { CustomRoleData } from '../schemas/CustomRole'
import { CustomRoleId, OrganizationId } from '../teambition'

export class RoleFetch extends BaseFetch {
  getDefaultRoles(): Observable<DefaultRoleData[]> {
    return this.fetch.get('roles')
  }

  getCustomRoles(organizationId: OrganizationId): Observable<CustomRoleData[]> {
    return this.fetch.get(`organizations/${organizationId}/roles`)
  }

  getOne(roleId: CustomRoleId): Observable<CustomRoleData> {
    return this.fetch.get(`roles/${roleId}`)
  }
}

export default new RoleFetch()
