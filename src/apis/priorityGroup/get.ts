import { SDKFetch } from '../../SDKFetch'
import { OrganizationId } from 'teambition-types'
import { PriorityGroupSchema } from '../../schemas/PriorityGroup'

export function getPrioritiesFetch(
  this: SDKFetch,
  _organizationId: OrganizationId,
) {
  return this.get<PriorityGroupSchema[]>(`organizations/${_organizationId}/priorities`)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getPriorities: typeof getPrioritiesFetch
  }
}

SDKFetch.prototype.getPriorities = getPrioritiesFetch
