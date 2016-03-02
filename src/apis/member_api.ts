'use strict'
import BaseAPI from './base_api'
import MemberModel from '../models/member_model'
import Member from '../schemas/member_schema'
import {IMemberData} from 'teambition'

export class MemberAPI extends BaseAPI {
  private MemberModel = new MemberModel()

  deleteMember(memberId: string): Promise<void> {
    return this.tbFetch.delete({
      Type: 'members',
      Id: memberId
    })
    .then(() => {
      return this.MemberModel.removeMember(memberId)
    })
  }

  getOrgMembers (organizationId: string): Promise<Member[]> {
    return this.MemberModel.getOrgMembers(organizationId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Version: 'V2',
        Type: 'organizations',
        Id: organizationId,
        Path1: 'members'
      }).then((members: IMemberData[]) => {
        return this.MemberModel.saveOrgMembers(organizationId, members)
      })
    })
  }

  getProjectMembers(projectId: string): Promise<Member[]> {
    return this.MemberModel.getProjectMembers(projectId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'projects',
        Id: projectId,
        Path1: 'members'
      })
      .then((members: IMemberData[]) => {
        return this.MemberModel.saveProjectMembers(projectId, members)
      })
    })
  }
}
