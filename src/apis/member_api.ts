'use strict'
import MemberFetch from '../fetchs/member_fetch'
import MemberModel from '../models/member_model'
import Member from '../schemas/member_schema'
import {MemberData} from '../teambition'

export class MemberAPI {
  public static MemberModel = new MemberModel()

  deleteMember(memberId: string): Promise<void> {
    return MemberFetch.deleteMember(memberId)
    .then(() => {
      return MemberAPI.MemberModel.removeMember(memberId)
    })
  }

  getOrgMembers (organizationId: string): Promise<Member[]> {
    return MemberAPI.MemberModel.getOrgMembers(organizationId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return MemberFetch
        .getOrgMembers(organizationId)
        .then((members: MemberData[]) => {
          return MemberAPI.MemberModel.saveOrgMembers(organizationId, members)
        })
    })
  }

  getProjectMembers(projectId: string): Promise<Member[]> {
    return MemberAPI.MemberModel.getProjectMembers(projectId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return MemberFetch
        .getProjectMembers(projectId)
        .then((members: MemberData[]) => {
          return MemberAPI.MemberModel.saveProjectMembers(projectId, members)
        })
    })
  }
}
