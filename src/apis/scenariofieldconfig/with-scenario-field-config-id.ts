import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators'

import { ScenarioFieldConfigSchema } from '../../schemas'

export function withScenarioFieldConfigId<
  T extends Partial<ScenarioFieldConfigSchema>
>(config: T): T {
  if (!config._id || !config.scenariofields) {
    return config
  }

  // 填补 _scenariofieldconfigId 字段
  const scenarioFields = config.scenariofields.map(
    (scenarioField): typeof scenarioField => {
      return {
        ...scenarioField,
        _scenariofieldconfigId: config._id
      }
    }
  )

  return {
    ...(config as object),
    scenariofields: scenarioFields
  } as typeof config
}

export function normalizeScenarioFieldConfig<
  T extends Partial<ScenarioFieldConfigSchema>
>(config$: Observable<T>): Observable<T> {
  return config$.pipe(
    map((config) => {
      return withScenarioFieldConfigId(config)
    })
  )
}

export function normalizeScenarioFieldConfigs<
  T extends Partial<ScenarioFieldConfigSchema>
>(configs$: Observable<T[]>): Observable<T[]> {
  return configs$.pipe(
    map((configs) => {
      return configs.map(withScenarioFieldConfigId)
    })
  )
}
