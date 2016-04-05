'use strict'
import BaseFetch from './base'
import {MemberData} from '../teambition'

export class MemberFetch extends BaseFetch {
  deleteMember(memberId: string): Promise<void> {
    return this.tbFetch.delete({
      Type: 'members',
      Id: memberId
    })
  }

  getOrgMembers (organizationId: string): Promise<MemberData[]> {
    return this.tbFetch.get({
      Version: 'V2',
      Type: 'organizations',
      Id: organizationId,
      Path1: 'members'
    })
  }

  getProjectMembers(projectId: string): Promise<MemberData[]> {
    return this.tbFetch.get({
      Type: 'projects',
      Id: projectId,
      Path1: 'members'
    })
  }
}

export default new MemberFetch()
