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
  return this.get<CustomFieldSchema>(`v2/customfields/${customFieldId}`)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getCustomField: typeof getCustomFieldFetch
  }
}

SDKFetch.prototype.getCustomField = getCustomFieldFetch

export interface GetCustomFieldOptions {
  request?: Observable<CustomFieldSchema> | Observable<CustomFieldSchema[]>
  /**
   * 填补数据，通常结合 withChoices=true | withProjects=true 一起使用
   *
   * 主要考虑如下场景：
   * 1. 使用 getScenarioFieldConfigs(appendCommonGroupChoices=false) 拿到的 需求分类/缺陷分类 缺少 choices 字段；
   * 2. 使用 getScenarioFieldConfigs(appendCommonGroupChoices=true) 拿到的 需求分类/缺陷分类 会带有 choices 字段；
   * 第 1 步，会把无效 choices 写入 RDB 缓存，为避免出现“无效 choices 在 RDB 长驻”这个问题，
   * 可指定 withChoices=true 解决，同时使用 padding=第 2 步拿到的有效数据 避免去后端重新请求造成浪费。
   */
  padding?: Observable<CustomFieldSchema | null>
  /**
   * 要求存在 choices 字段
   *
   * 使用 getScenarioFieldConfigs 拿到的 需求分类/缺陷分类 缺少 choices 字段，
   * 当指明 withChoices=true 时候，会通过 padding 获取完整数据。
   */
  withChoices?: boolean
  /**
   * 要求存在 projects 字段
   *
   * 使用 getScenarioFieldConfigs 拿到的 CustomField 缺少 projects 字段，
   * 当指明 withProjects=true 时候，会通过 padding 获取完整数据。
   */
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
