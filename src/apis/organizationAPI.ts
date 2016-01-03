'use strict'
import {tbFetch} from '../utils/fetch'
import {organizationModel} from '../models'
import {IOrganizationData} from 'teambition'

export const OrganizationAPI = {
  getOrganizations: () => {
    const cache = organizationModel.getAll()
    if (cache) {
      return new Promise((resolve, reject) => {
        resolve(cache)
      })
    }else {
      return tbFetch.get({
        Type: 'organizations'
      }).then((organizations: IOrganizationData[]) => {
        organizationModel.setAll(organizations)
        return organizations
      })
    }
  }
}
