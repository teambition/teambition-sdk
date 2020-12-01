import { CustomFieldId, OrganizationId } from 'teambition-types'
import { CustomFieldSchema } from '../../schemas'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'

export function lockCustomFieldFetch(
  this: SDKFetch,
  orgId: OrganizationId,
  customFieldId: CustomFieldId,
  isLocked: boolean
) {
  const url = `v2/organizations/${orgId}/customfields/${customFieldId}/is-locked`
  const body = { isLocked: isLocked }

  return this.put<CustomFieldSchema>(url, body)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    lockCustomField: typeof lockCustomFieldFetch
  }
}

SDKFetch.prototype.lockCustomField = lockCustomFieldFetch

export function lockCustomField(
  this: SDK,
  orgId: OrganizationId,
  customFieldId: CustomFieldId,
  isLocked: boolean
) {
  return this.lift({
    tableName: 'CustomField',
    method: 'update',
    request: this.fetch.lockCustomField(orgId, customFieldId, isLocked),
    clause: { _id: customFieldId }
  })
}

declare module '../../SDK' {
  interface SDK {
    lockCustomField: typeof lockCustomField
  }
}

SDK.prototype.lockCustomField = lockCustomField
