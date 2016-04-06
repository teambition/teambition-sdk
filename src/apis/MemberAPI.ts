'use strict'
import {MemberFetch} from '../fetchs/MemberFetch'
import MemberModel from '../models/MemberModel'
import Member from '../schemas/Member'
import {MemberData} from '../teambition'

const memberFetch = new MemberFetch()

export class MemberAPI {
  public static MemberModel = new MemberModel()

  deleteMember(memberId: string): Promise<void> {
    return memberFetch.deleteMember(memberId)
    .then(() => {
      return MemberAPI.MemberModel.removeMember(memberId)
    })
  }

  getOrgMembers (organizationId: string): Promise<Member[]> {
    return MemberAPI.MemberModel.getOrgMembers(organizationId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return memberFetch
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
      return memberFetch
        .getProjectMembers(projectId)
        .then((members: MemberData[]) => {
          return MemberAPI.MemberModel.saveProjectMembers(projectId, members)
        })
    })
  }
}
