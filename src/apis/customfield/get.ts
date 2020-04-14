import { Observable } from 'rxjs/Observable'
import { CustomFieldId } from 'teambition-types'

import { QueryToken } from '../../db'
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
  padding?: Observable<CustomFieldSchema | null>
  withChoices?: boolean
  withProjects?: boolean
}

export function getCustomField(
  this: SDK,
  customFieldId: CustomFieldId,
  options: GetCustomFieldOptions = {}
): QueryToken<CustomFieldSchema> {
  const req = options.request || this.fetch.getCustomField(customFieldId)

  const required: Array<keyof CustomFieldSchema> = []

  // 确保 choices 存在（主要考虑 需求分类、缺陷分类 choices 无效情况，可结合 padding 解决问题）
  if (options.withChoices) { required.push('choices') }

  // 使用 `getScenarioFieldConfigs` 拿到的 CustomField 数据已经满足各种业务场景的。
  // 但这个 CustomField 会缺少 `projects` 数据。
  // 但这个 `projects` 又不是 CustomField 自身属性，所以 `getScenarioFieldConfigs` 给的数据是合理的。
  // 所以 `getScenarioFieldConfigs` 给的 CustomField 数据一旦通过 `options.request` 进入 RDB 缓存，
  // 那么这里的 `getCustomField` 返回数据就始终缺少 `projects` 数据。
  // 所以通过 `options.withProjects = required + padding` 来解决。
  if (options.withProjects) { required.push('projects') }

  return this.lift<CustomFieldSchema>({
    tableName: 'CustomField',
    cacheValidate: CacheStrategy.Request,
    request: req,
    query: {
      where: { _id: customFieldId }
    },
    assocFields: {
      creator: ['_id', 'name', 'avatarUrl'],
      locker: ['_id', 'name', 'avatarUrl']
    },
    required,
    padding: () => options.padding || this.fetch.getCustomField(customFieldId)
  })
}

declare module '../../SDK' {
  interface SDK {
    getCustomField: typeof getCustomField
  }
}

SDK.prototype.getCustomField = getCustomField
