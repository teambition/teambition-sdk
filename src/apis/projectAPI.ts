'use strict'
import {tbFetch} from '../utils/fetch'
import MemberModel from '../models/MemberModel'
import {Member} from '../schemas/member'
import {IMemberData} from 'teambition'

export const ProjectAPI = {
  getMembers(projectId: string): Promise<Member[]> {
    const cache = MemberModel.getProjectMembers(projectId)
    if (cache) {
      return new Promise<Member[]>((resolve, reject) => {
        resolve(cache)
      })
    }else {
      return tbFetch.get({
        Type: 'projects',
        Id: projectId,
        Path1: 'members'
      })
      .then((members: IMemberData[]) => {
        return MemberModel.setProjectMembers(projectId, members)
      })
    }
  },

  deleteMember(memberId: string) {
    return tbFetch.delete({
      Type: 'members',
      Id: memberId
    })
    .then(() => {
      MemberModel.removeMember(memberId)
    })
  }
}
