import { Observable } from 'rxjs/Observable'
import { of } from 'rxjs/observable/of'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { map } from 'rxjs/operators'

import { ScenarioFieldConfigSchema, ScenarioFieldSchema } from '../../schemas'
import { isCustomScenarioField } from './util'
import { SDK } from '../../SDK'

export const withCustomFields = <T extends ScenarioFieldConfigSchema>(
  sdk: SDK,
  config: T
): Observable<T> => {
  if (config.scenariofields.length === 0) {
    return of(config)
  }

  // 给 ScenarioField 填充 CustomField 数据
  const scenarioFields$ = combineLatest(
    config.scenariofields.map((scenarioField) => {
      return withCustomField(sdk, scenarioField)
    })
  )

  // 更新 config.scenariofields 字段
  return scenarioFields$.pipe(
    map((scenarioFields) => {
      const nextConfig = { ...(config as object) } as typeof config
      nextConfig.scenariofields = scenarioFields

      return nextConfig
    })
  )
}

export const withCustomField = <T extends ScenarioFieldSchema>(
  sdk: SDK,
  scenarioField: T
): Observable<T> => {
  // 官方字段
  if (!isCustomScenarioField(scenarioField)) {
    return of(scenarioField)
  }

  const customFieldId = scenarioField._customfieldId

  // 不发起请求，只读缓存数据，若没有缓存则返回 undefined 值
  const customField$ = sdk
    .getCustomField(customFieldId, { cacheOnly: true })
    .changes()
    .pipe(map(([customField]) => customField))

  // 更新 scenarioField.customfield 字段
  return customField$.pipe(
    map((customField) => {
      const nextScenarioField = {
        ...(scenarioField as object)
      } as typeof scenarioField
      nextScenarioField.customfield = customField

      return nextScenarioField
    })
  )
}
