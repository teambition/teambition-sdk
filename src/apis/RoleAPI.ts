'use strict'
import { Observable } from 'rxjs/Observable'
import { CustomRoleData } from '../schemas/CustomRole'
import RoleFetch from '../fetchs/RoleFetch'
import { DefaultRoleData } from '../schemas/DefaultRole'
import RoleModel from '../models/RoleModel'
import { makeColdSignal } from './utils'

export class RoleAPI {
  getDefaultRoles(): Observable<DefaultRoleData[]> {
    return makeColdSignal<DefaultRoleData[]>(() => {
      const cache = RoleModel.getDefault()
      if (cache) {
        return cache
      }
      return RoleFetch.getDefaultRoles()
        .concatMap(x => RoleModel.addDefault(x))
    })
  }

  getCustomRoles(organizationId: string): Observable<CustomRoleData[]> {
    return makeColdSignal<CustomRoleData[]>(() => {
      const cache = RoleModel.getRoles(organizationId)
      if (cache) {
        return cache
      }
      return RoleFetch.getCustomRoles(organizationId)
        .concatMap(x => RoleModel.addRoles(organizationId, x))
    })
  }

  getOne(roleId: string): Observable<CustomRoleData> {
    return makeColdSignal<CustomRoleData>(() => {
      const cache = RoleModel.getOne(roleId)
      if (cache) {
        return cache
      }
      return RoleFetch.getOne(roleId)
        .concatMap(x => RoleModel.addOne(x))
    })
  }
}

export default new RoleAPI
