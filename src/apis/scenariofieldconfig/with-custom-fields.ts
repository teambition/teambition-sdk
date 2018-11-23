import { map } from 'rxjs/operators'
import { MonoTypeOperatorFunction } from 'rxjs/interfaces'

import { ScenarioFieldConfigSchema } from '../../schemas'

export const withScenarioFieldConfigId = <T extends ScenarioFieldConfigSchema>(
  config: T
): T => {
  // 填补 _scenariofieldconfigId 字段
  const scenarioFields = config.scenariofields.map((scenarioField) => {
    return {
      ...scenarioField,
      _scenariofieldconfigId: config._id
    } as typeof scenarioField
  })

  return {
    ...(config as object),
    scenariofields: scenarioFields
  } as typeof config
}

export const normalizeScenarioFieldConfigs: MonoTypeOperatorFunction<
  ScenarioFieldConfigSchema[]
> = (configs$) => {
  return configs$.pipe(
    map((configs) => {
      return configs.map(withScenarioFieldConfigId)
    })
  )
}
