import { Observable } from 'rxjs/Observable'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { switchMap } from 'rxjs/operators/switchMap'
import { map } from 'rxjs/operators/map'
import { catchError } from 'rxjs/operators/catchError'

import {
  ScenarioFieldConfigSchema,
  ScenarioFieldSchema,
  CustomScenarioFieldSchema,
  CustomFieldSchema,
  CustomFieldLinkSchema
} from '../../schemas'
import { SDK } from '../../SDK'

export const withCustomFields = (sdk: SDK) => (
  configs$: Observable<ScenarioFieldConfigSchema[]>
): Observable<ScenarioFieldConfigSchema[]> => {
  return configs$.pipe(
    switchMap((configs) => {
      if (configs.length === 0) {
        return Observable.of(configs)
      }

      return combineLatest(configs.map(normalizeScenarioFieldConfig(sdk)))
    })
  )
}

const normalizeScenarioFieldConfig = (sdk: SDK) => (
  config: ScenarioFieldConfigSchema
): Observable<ScenarioFieldConfigSchema> => {
  if (config.scenariofields.length === 0) {
    return Observable.of(config)
  }

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

  return getCustomField(sdk, scenarioField).pipe(
    map(
      (customField): CustomScenarioFieldSchema => {
        return customField
          ? { ...scenarioField, customfield: customField }
          : scenarioField
      }
    )
  )
}

const getCustomField = (
  sdk: SDK,
  scenarioField: CustomScenarioFieldSchema
): Observable<CustomFieldSchema | void> => {
  const empty$ = Observable.of([])
  const customFieldId = scenarioField._customfieldId
  const customField$ = scenarioField.customfield
    ? Observable.of(scenarioField.customfield)
    : void 0

  // 从企业里请求 CustomField 数据
  return sdk
    .getCustomField(customFieldId, { req: customField$ })
    .changes()
    .pipe(
      catchError(() => {
        // 可能不是企业成员，请求数据失败
        // 那么读取 CustomFieldLink 数据
        return sdk
          .getLinkByCustomFieldId(customFieldId, { req: empty$ })
          .changes()
          .pipe(
            map(([link]) => {
              // 将 CustomFieldLink 当做 CustomField 使用
              return link ? [linkToCustomField(link) as CustomFieldSchema] : []
            })
          )
      }),
      map(([customField]) => {
        return customField ? customField : void 0
      })
    )
}

const linkToCustomField = (link: CustomFieldLinkSchema) => {
  return {
    ...link,
    _id: link._customfieldId,
    _advancedCustomfieldId: link.advancedCustomfield
      ? link.advancedCustomfield._id
      : null
  } as Partial<CustomFieldSchema>
}

export const isCustomScenarioFieldSchema = (
  it: ScenarioFieldSchema
): it is CustomScenarioFieldSchema => {
  return it.fieldType === 'customfield'
}
