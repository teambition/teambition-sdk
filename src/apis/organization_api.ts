'use strict'
import {tbFetch} from '../utils/fetch'
import OrganizationModel from '../models/organization_model'
import MemberModel from '../models/member_model'
import Member from '../schemas/member_schema'
import {IOrganizationData, IMemberData} from 'teambition'

export const OrganizationAPI = {
  getOrgs: (): Promise<IOrganizationData[]> => {
    const cache = OrganizationModel.getAll()
    if (cache) return Promise.resolve(cache)
    return tbFetch.get({
      Type: 'organizations'
    }).then((organizations: IOrganizationData[]) => {
      return OrganizationModel.setAll(organizations)
    })
  },
  getOne: (organizationId: string): Promise<IOrganizationData> => {
    const cache = OrganizationModel.get(organizationId)
    if (cache) return Promise.resolve(cache)
    return tbFetch.get({
      Type: 'organizations',
      Id: organizationId
    })
    .then((organization: IOrganizationData) => {
      return OrganizationModel.set(organization)
    })
  },
  getMembers: (organizationId: string): Promise<Member[]> => {
    const cache = MemberModel.getOrgMembers(organizationId)
    if (cache) return Promise.resolve(cache)
    return tbFetch.get({
      Version: 'V2',
      Type: 'organizations',
      Id: organizationId,
      Path1: 'members'
    }).then((members: IMemberData[]) => {
      return MemberModel.addOrgMembers(organizationId, members)
    })
  }
}
