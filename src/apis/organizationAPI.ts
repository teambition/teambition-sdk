'use strict'
import {tbFetch} from '../utils/fetch'
import OrganizationModel from '../models/OrganizationModel'
import MemberModel from '../models/MemberModel'
import {IOrganizationData, IMemberData} from 'teambition'

export const OrganizationAPI = {
  getAll: (): Promise<IOrganizationData[]> => {
    const cache = OrganizationModel.getAll()
    return cache ?
    new Promise((resolve, reject) => {
      resolve(cache)
    }) :
    tbFetch.get({
      Type: 'organizations'
    }).then((organizations: IOrganizationData[]) => {
      return OrganizationModel.setAll(organizations)
    })
  },
  getOne: (organizationId: string): Promise<IOrganizationData> => {
    const cache = OrganizationModel.get(organizationId)
    return cache ?
    new Promise((resolve, reject) => {
      resolve(cache)
    }) :
    tbFetch.get({
      Type: 'organizations',
      Id: organizationId
    })
    .then((organization: IOrganizationData) => {
      return OrganizationModel.set(organization)
    })
  },
  getMembers: (organizationId: string): Promise<IMemberData[]> => {
    const cache = MemberModel.getOrgMember(organizationId)
    return cache ?
    new Promise((resolve, reject) => {
      resolve(cache)
    }) :
    tbFetch.get({
      Version: 'V2',
      Type: 'organizations',
      Id: organizationId,
      Path1: 'members'
    }).then((members: IMemberData[]) => {
      return MemberModel.setOrgMember(organizationId, members)
    })
  }
}
