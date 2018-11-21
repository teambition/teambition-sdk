import { Observable } from 'rxjs/Observable'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { map, switchMap } from 'rxjs/operators'

import {
  ScenarioFieldConfigSchema,
  ScenarioFieldSchema,
  CustomScenarioFieldSchema
} from '../../schemas'
import { SDK } from '../../SDK'

export const withCustomFields = (sdk: SDK) => (
  configs$: Observable<ScenarioFieldConfigSchema[]>
): Observable<ScenarioFieldConfigSchema[]> => {
  return configs$.pipe(
    switchMap((configs) => {
      return combineLatest(configs.map(normalizeScenarioFieldConfig(sdk)))
    })
  )
}

const normalizeScenarioFieldConfig = (sdk: SDK) => (
  config: ScenarioFieldConfigSchema
): Observable<ScenarioFieldConfigSchema> => {
  const scenarioFields$ = combineLatest(
    config.scenariofields.map(normalizeScenarioField(sdk))
  )

  return scenarioFields$.pipe(
    map(
      (scenarioFields): ScenarioFieldConfigSchema => {
        return {
          ...config,
          scenariofields: scenarioFields
        }
      }
    )
  )
}

const normalizeScenarioField = (sdk: SDK) => (
  scenarioField: ScenarioFieldSchema
): Observable<ScenarioFieldSchema> => {
  if (!isCustomScenarioFieldSchema(scenarioField)) {
    return Observable.of(scenarioField)
  }

  const customField$ = scenarioField.customfield
    ? Observable.of(scenarioField.customfield)
    : Observable.of([])

  return sdk
    .getCustomField(scenarioField._customfieldId, { req: customField$ })
    .changes()
    .pipe(
      map(
        ([customField]): CustomScenarioFieldSchema => {
          return {
            ...scenarioField,
            customfield: customField
          }
        }
      )
    )
}

const isCustomScenarioFieldSchema = (
  it: ScenarioFieldSchema
): it is CustomScenarioFieldSchema => {
  return it.fieldType === 'customfield'
}
