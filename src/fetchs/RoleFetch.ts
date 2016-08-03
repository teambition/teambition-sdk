'use strict'
import BaseFetch from './BaseFetch'
import { DefaultRoleData } from '../schemas/DefaultRole'
import { CustomRoleData } from '../schemas/CustomRole'

export class RoleFetch extends BaseFetch {
  getDefaultRoles(): Promise<DefaultRoleData[]> {
    return this.fetch.get('roles')
  }

  getCustomRoles(organizationId: string): Promise<CustomRoleData[]> {
    return this.fetch.get(`organizations/${organizationId}/roles`)
  }

  getOne(roleId: string): Promise<CustomRoleData> {
    return this.fetch.get(`roles/${roleId}`)
  }
}

export default new RoleFetch()
