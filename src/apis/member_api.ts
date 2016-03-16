'use strict'
import BaseAPI from './base_api'
import MemberModel from '../models/member_model'
import Member from '../schemas/member_schema'
import {MemberData} from '../teambition'

export class MemberAPI extends BaseAPI {
  public static MemberModel = new MemberModel()

  deleteMember(memberId: string): Promise<void> {
    return this.tbFetch.delete({
      Type: 'members',
      Id: memberId
    })
    .then(() => {
      return MemberAPI.MemberModel.removeMember(memberId)
    })
  }

  getOrgMembers (organizationId: string): Promise<Member[]> {
    return MemberAPI.MemberModel.getOrgMembers(organizationId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Version: 'V2',
        Type: 'organizations',
        Id: organizationId,
        Path1: 'members'
      }).then((members: MemberData[]) => {
        return MemberAPI.MemberModel.saveOrgMembers(organizationId, members)
      })
    })
  }

  getProjectMembers(projectId: string): Promise<Member[]> {
    return MemberAPI.MemberModel.getProjectMembers(projectId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'projects',
        Id: projectId,
        Path1: 'members'
      })
      .then((members: MemberData[]) => {
        return MemberAPI.MemberModel.saveProjectMembers(projectId, members)
      })
    })
  }
}
