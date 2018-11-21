import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { concatMap } from 'rxjs/operators'
import { ProjectId, ScenarioFieldConfigObjectType } from 'teambition-types'

import { SDK } from '../../SDK'
import { GetScenarioFieldConfigsOptions } from './get-by-project-id'
import { withCustomFields } from './with-custom-fields'
import { ScenarioFieldConfigSchema } from '../../schemas'

type Options = Pick<GetScenarioFieldConfigsOptions, 'withTaskflowstatus'>

export function getScenarioFieldConfigsWithCustomFields(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  options: Options = {}
): Observable<ScenarioFieldConfigSchema[]> {
  const configs$ = this.getScenarioFieldConfigs(projectId, objectType, {
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
    getScenarioFieldConfigsWithCustomFields: typeof getScenarioFieldConfigsWithCustomFields
  }
}

SDK.prototype.getScenarioFieldConfigsWithCustomFields = getScenarioFieldConfigsWithCustomFields
