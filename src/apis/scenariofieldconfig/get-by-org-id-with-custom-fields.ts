import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { concatMap } from 'rxjs/operators'
import { ScenarioFieldConfigObjectType, OrganizationId } from 'teambition-types'

import { SDK } from '../../SDK'
import { withCustomFields } from './with-custom-fields'
import { ScenarioFieldConfigSchema } from '../../schemas'
import { GetOrgScenarioFieldConfigsOptions } from './get-by-org-id'

export function getOrgScenarioFieldConfigsWithCustomFields(
  this: SDK,
  organizationId: OrganizationId,
  objectType: ScenarioFieldConfigObjectType,
  options: GetOrgScenarioFieldConfigsOptions = {}
): Observable<ScenarioFieldConfigSchema[]> {
  const configs$ = this.getOrgScenarioFieldConfigs(organizationId, objectType, {
    ...options,
    withCustomfields: true // 请求结果包含有 CustomField 数据
  }).changes()

  return configs$.pipe(
    concatMap((configs) => {
      // 持续从缓存里读取最新的 CustomField 数据
      const nextConfigs$ = combineLatest(
        configs.map((config) => withCustomFields(this, config))
      )

      return nextConfigs$
    })
  )
}

declare module '../../SDK' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDK {
    getOrgScenarioFieldConfigsWithCustomFields: typeof getOrgScenarioFieldConfigsWithCustomFields
  }
}

SDK.prototype.getOrgScenarioFieldConfigsWithCustomFields = getOrgScenarioFieldConfigsWithCustomFields
