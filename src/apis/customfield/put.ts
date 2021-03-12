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
  const url = `organizations/${orgId}/customfields/${customFieldId}/islocked`
  const body = { isLocked: isLocked }

  return this.put<CustomFieldSchema>(url, body)
}

export function lockCustomFieldFetchV2(
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
    lockCustomFieldV2: typeof lockCustomFieldFetchV2
  }
}

SDKFetch.prototype.lockCustomField = lockCustomFieldFetch
SDKFetch.prototype.lockCustomFieldV2 = lockCustomFieldFetchV2

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

export function lockCustomFieldV2(
  this: SDK,
  orgId: OrganizationId,
  customFieldId: CustomFieldId,
  isLocked: boolean
) {
  return this.lift({
    tableName: 'CustomField',
    method: 'update',
    request: this.fetch.lockCustomFieldV2(orgId, customFieldId, isLocked),
    clause: { _id: customFieldId }
  })
}

declare module '../../SDK' {
  interface SDK {
    lockCustomField: typeof lockCustomField
    lockCustomFieldV2: typeof lockCustomFieldV2
  }
}

SDK.prototype.lockCustomField = lockCustomField
SDK.prototype.lockCustomFieldV2 = lockCustomFieldV2
