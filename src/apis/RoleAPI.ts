'use strict'
import { Observable } from 'rxjs/Observable'
import { CustomRoleData } from '../schemas/CustomRole'
import RoleFetch from '../fetchs/RoleFetch'
import { DefaultRoleData } from '../schemas/DefaultRole'
import RoleModel from '../models/RoleModel'
import { makeColdSignal, errorHandler } from './utils'

export class RoleAPI {
  constructor() {
    RoleModel.destructor()
  }

  getDefaultRoles(): Observable<DefaultRoleData[]> {
    return makeColdSignal<DefaultRoleData[]>(observer => {
      const cache = RoleModel.getDefault()
      if (cache) {
        return cache
      }
      return Observable.fromPromise(RoleFetch.getDefaultRoles())
        .catch(err => errorHandler(observer, err))
        .concatMap(x => RoleModel.addDefault(x))
    })
  }

  getCustomRoles(organizationId: string): Observable<CustomRoleData[]> {
    return makeColdSignal<CustomRoleData[]>(observer => {
      const cache = RoleModel.getRoles(organizationId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(RoleFetch.getCustomRoles(organizationId))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => RoleModel.addRoles(organizationId, x))
    })
  }

  getOne(roleId: string): Observable<CustomRoleData> {
    return makeColdSignal<CustomRoleData>(observer => {
      const cache = RoleModel.getOne(roleId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(RoleFetch.getOne(roleId))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => RoleModel.addOne(x))
    })
  }
}
