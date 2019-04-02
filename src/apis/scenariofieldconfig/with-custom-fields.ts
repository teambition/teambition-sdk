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

export const withCustomFields = (
  sdk: SDK,
  options: WithCustomFieldsOptions
) => (
  configs$: Observable<ScenarioFieldConfigSchema[]>
): Observable<ScenarioFieldConfigSchema[]> => {
  return configs$.pipe(
    switchMap((configs) => {
      if (configs.length === 0) {
        return Observable.of(configs)
      }

      return combineLatest(
        configs.map(normalizeScenarioFieldConfig(sdk, options))
      )
    })
  )
}

const normalizeScenarioFieldConfig = (
  sdk: SDK,
  options: WithCustomFieldsOptions
) => (
  config: ScenarioFieldConfigSchema
): Observable<ScenarioFieldConfigSchema> => {
  if (config.scenariofields.length === 0) {
    return Observable.of(config)
  }

  const scenarioFields$ = combineLatest(
    config.scenariofields.map(normalizeScenarioField(sdk, options))
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

const normalizeScenarioField = (sdk: SDK, options: WithCustomFieldsOptions) => (
  scenarioField: ScenarioFieldSchema
): Observable<ScenarioFieldSchema> => {
  if (!isCustomScenarioFieldSchema(scenarioField)) {
    return Observable.of(scenarioField)
  }

  return getCustomField(sdk, scenarioField, options).pipe(
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
  scenarioField: CustomScenarioFieldSchema,
  options: WithCustomFieldsOptions
): Observable<CustomFieldSchema | void> => {
  const empty$ = Observable.of([])
  const customFieldId = scenarioField._customfieldId

  // 自带 CustomField 数据
  const customField$ = scenarioField.customfield
    ? Observable.of(scenarioField.customfield)
    : void 0

  // [fallback] 缺少 CustomField 数据，当 forcePaddingCustomField=true 那么发送请求进行获取
  const customFieldPadding$ =
    options.forcePaddingCustomField &&
    // 从企业里请求 CustomField 数据
    sdk.fetch.getCustomField(customFieldId).pipe(
      map((resp) => [resp]),
      catchError(() => {
        // 可能不是企业成员，请求数据失败
        // 由于 ScenarioField.CustomField 数据终究是可选的，因此认为这个失败不是致命的
        // 返回 empty 允许程序继续工作
        return Observable.of([] as CustomFieldSchema[])
      })
    )

  // [fallback] 缺少 CustomField 数据，将 CustomFieldLink 当做 CustomField 使用
  const customFieldLink$ = sdk
    .getLinkByCustomFieldId(customFieldId, { request: empty$ })
    .changes()
    .pipe(
      map(([link]) => {
        return link ? [linkToCustomField(link) as CustomFieldSchema] : []
      })
    )

  return sdk
    .getCustomField(customFieldId, {
      request: customField$ || customFieldPadding$ || empty$
    })
    .changes()
    .pipe(
      switchMap(([customField]) => {
        return customField ? Observable.of([customField]) : customFieldLink$
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

export interface WithCustomFieldsOptions {
  /**
   * 当缺少 CustomField 数据，总会发送请求进行获取
   */
  forcePaddingCustomField?: boolean
}
