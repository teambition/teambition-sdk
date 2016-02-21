'use strict'
import BaseAPI from './base_api'
import OrganizationModel from '../models/organization_model'
import MemberModel from '../models/member_model'
import Member from '../schemas/member_schema'
import {IOrganizationData, IMemberData} from 'teambition'

export class OrganizationsAPI extends BaseAPI {

  private MemberModel = new MemberModel()
  private OrganizationModel = new OrganizationModel()

  getOrgs (): Promise<IOrganizationData[]> {
    return this.OrganizationModel.getAll()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'organizations'
      }).then((organizations: IOrganizationData[]) => {
        return this.OrganizationModel.saveAll(organizations)
      })
    })
  }

  getOne (organizationId: string): Promise<IOrganizationData> {
    return this.OrganizationModel.get(organizationId)
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'organizations',
        Id: organizationId
      })
      .then((organization: IOrganizationData) => {
        return this.OrganizationModel.set(organization)
      })
    })
  }

  getMembers (organizationId: string): Promise<Member[]> {
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
}
