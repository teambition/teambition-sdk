import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'

import { CustomFieldId } from 'teambition-types'
import { CacheStrategy } from '../../Net'
import { CustomFieldSchema } from '../../schemas'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'

export function getCustomFieldFetch(
  this: SDKFetch,
  customFieldId: CustomFieldId
): Observable<CustomFieldSchema> {
  return this.get<CustomFieldSchema>(`customfields/${customFieldId}`)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getCustomField: typeof getCustomFieldFetch
  }
}

SDKFetch.prototype.getCustomField = getCustomFieldFetch

export interface GetCustomFieldOptions {
  request?: Observable<CustomFieldSchema> | Observable<CustomFieldSchema[]>
}

export function getCustomField(
  this: SDK,
  customFieldId: CustomFieldId,
  options: GetCustomFieldOptions = {}
): QueryToken<CustomFieldSchema> {
  const req = options.request || this.fetch.getCustomField(customFieldId)

  return this.lift<CustomFieldSchema>({
    tableName: 'CustomField',
    cacheValidate: CacheStrategy.Request,
    request: req,
    query: {
      where: { _id: customFieldId }
    }
  })
}

declare module '../../SDK' {
  interface SDK {
    getCustomField: typeof getCustomField
  }
}

SDK.prototype.getCustomField = getCustomField
