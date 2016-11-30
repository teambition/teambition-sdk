'use strict'
import { Observable } from 'rxjs/Observable'
import { GroupData } from '../schemas/Group'
import GroupModel from '../models/GroupModel'
import GroupFetch from '../fetchs/GroupFetch'
import { GroupId, OrganizationId, UserId } from '../teambition'
import { makeColdSignal } from './utils'

export class GroupAPI {

  get(groupId: GroupId, query?: any): Observable<GroupData> {
    return makeColdSignal<GroupData>(() => {
      const cache = GroupModel.getOne(groupId)
      if (cache && GroupModel.checkSchema(<string>groupId)) {
        return cache
      }
      return GroupFetch.get(groupId, query)
        .concatMap(group => GroupModel.addOne(group))
    })
  }

  getByOrganizationId(
    organizationId: OrganizationId,
    query?: any
  ): Observable<GroupData[]> {
    return makeColdSignal<GroupData[]>(() => {
      const page = query && query.page || 1
      const cache = GroupModel.getByOrganizationId(organizationId, page)
      if (cache) {
        return cache
      }
      return GroupFetch.getByOrganizationId(organizationId, query)
        .concatMap(groups => {
          return GroupModel.addByOrganizationId(organizationId, groups, page)
        })
    })
  }

  getByMe(
    userId: UserId,
    query?: any
  ): Observable<GroupData[]> {
    return makeColdSignal<GroupData[]>(() => {
      const page = query && query.page || 1
      const cache = GroupModel.getByUserId(userId, page)
      if (cache) {
        return cache
      }
      return GroupFetch.getByMe(query)
        .concatMap(groups => {
          return GroupModel.addByUserId(userId, groups, page)
        })
    })
  }
}

export default new GroupAPI
