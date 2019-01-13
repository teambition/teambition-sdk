import { describe, before, beforeEach, afterEach, it, after } from 'tman'
import { Scheduler } from 'rxjs'
import { expect } from 'chai'

import { SDKFetch, createSdk, SDK, ScenarioFieldConfigSchema } from '../'
import {
  taskScenarioFieldConfig,
  eventScenarioFieldConfig,
  orgTaskScenarioFieldConfig,
  orgEventScenarioFieldConfig
} from '../fixtures/scenariofieldconfigs.fixture'
import { expectToDeepEqualForFieldsOfTheExpected } from '../utils'
import {
  OrganizationId,
  ProjectId,
  ScenarioFieldConfigId,
  CustomFieldId
} from 'teambition-types'
import {
  ScenarioFieldSchema,
  CustomScenarioFieldSchema,
  CustomFieldSchema,
  CustomFieldLinkSchema
} from '../../src'

const fetchMock = require('fetch-mock')

describe('ScenarioFieldConfigApi request spec: ', () => {
  before(() => {
    SDKFetch.fetchTail = '666'
  })

  after(() => {
    SDKFetch.fetchTail = undefined
  })

  let sdkFetch: SDKFetch

  beforeEach(() => {
    sdkFetch = new SDKFetch()
    sdkFetch.setAPIHost('')
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should return a TaskScenarioFieldConfig array', function*() {
    const projectId = taskScenarioFieldConfig._projectId as ProjectId
    const configs = [taskScenarioFieldConfig]
    const url = `/projects/${projectId}/scenariofieldconfigs?objectType=task&withTaskflowstatus=true&_=666`

    fetchMock.once(url, configs)

    yield sdkFetch
      .getScenarioFieldConfigs(projectId, 'task', { withTaskflowstatus: true })
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should return an EventScenarioFieldConfig array', function*() {
    const projectId = eventScenarioFieldConfig._projectId as ProjectId
    const configs = [eventScenarioFieldConfig]
    const url = `/projects/${projectId}/scenariofieldconfigs?objectType=event&withTaskflowstatus=true&_=666`

    fetchMock.once(url, configs)

    yield sdkFetch
      .getScenarioFieldConfigs(projectId, 'event', { withTaskflowstatus: true })
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should return a TaskScenarioFieldConfig array bound to Organization', function*() {
    const orgId = orgTaskScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgTaskScenarioFieldConfig]
    const url = `/organizations/${orgId}/scenariofieldconfigs?sort=project_desc&objectType=task&_=666`

    fetchMock.once(url, { result: configs, nextPageToken: '' })

    yield sdkFetch
      .getOrgScenarioFieldConfigs(orgId, 'task', { sort: 'project_desc' })
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should return an EventScenarioFieldConfig array bound to Organization', function*() {
    const orgId = orgEventScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgEventScenarioFieldConfig]
    const url = `/organizations/${orgId}/scenariofieldconfigs?objectType=event&_=666`

    fetchMock.once(url, { result: configs, nextPageToken: '' })

    yield sdkFetch
      .getOrgScenarioFieldConfigs(orgId, 'event')
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should add a TaskScenarioFieldConfig array to Project', function*() {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId
    const config = { ...taskScenarioFieldConfig, _id: configId }
    const projectId = config._boundToObjectId as ProjectId
    const configIds = [configId]
    const configs = [config]

    fetchMock.postOnce((url: string, opts: any) => {
      return (
        url === `/projects/${projectId}/scenariofieldconfigs/bulk` &&
        opts.body.objectType === 'task'
      )
    }, configs)

    yield sdkFetch
      .bulkAddScenarioFieldConfigs(projectId, 'task', configIds)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(configs)
      })
  })

  it('should add an EventScenarioFieldConfig array to Project', function*() {
    const configId = 'mock-event-sf-config-id' as ScenarioFieldConfigId
    const config = { ...eventScenarioFieldConfig, _id: configId }
    const projectId = config._boundToObjectId as ProjectId
    const configIds = [configId]
    const configs = [config]

    fetchMock.postOnce((url: string, opts: any) => {
      return (
        url === `/projects/${projectId}/scenariofieldconfigs/bulk` &&
        opts.body.objectType === 'event'
      )
    }, configs)

    yield sdkFetch
      .bulkAddScenarioFieldConfigs(projectId, 'event', configIds)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(configs)
      })
  })

  it('should restore ScenarioFieldConfig to the Base', function*() {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId
    const config = { ...taskScenarioFieldConfig, _id: configId }

    fetchMock.putOnce(`/scenariofieldconfigs/${configId}/restore`, config)

    yield sdkFetch
      .restoreScenarioFieldConfig(configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(config)
      })
  })

  it('should save ScenarioFieldConfig as the Base', function*() {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId

    fetchMock.putOnce(`/scenariofieldconfigs/${configId}/sync`, {})

    yield sdkFetch
      .syncScenarioFieldConfig(configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal({})
      })
  })

  it('should return an array of Project using the ScenarioFieldConfig', function*() {
    const sfcId = 'mock-sf-config-id' as ScenarioFieldConfigId
    const resp = { totalSize: 10, result: ['p1', 'p2'] }

    fetchMock.once(`/scenariofieldconfigs/${sfcId}/projects?_=666`, resp)

    yield sdkFetch
      .getOrgScenarioFieldConfigProjects(sfcId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(resp)
      })
  })

  it('should create a new ScenarioFieldConfig', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const config = { ...orgTaskScenarioFieldConfig, _id: configId } as any
    const orgId = config._boundToObjectId as OrganizationId

    fetchMock.postOnce(`/organizations/${orgId}/scenariofieldconfigs`, config)

    yield sdkFetch
      .createOrgScenarioFieldConfig(orgId, config)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(config)
      })
  })

  it('should delete ScenarioFieldConfig', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const orgId = 'mock-org-id' as OrganizationId

    fetchMock.deleteOnce(
      `/organizations/${orgId}/scenariofieldconfigs/${configId}`,
      {}
    )

    yield sdkFetch
      .deleteOrgScenarioFieldConfig(orgId, configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal({})
      })
  })

  it('should update ScenarioFieldConfig', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const config = { name: 'mock-sfc-name' } as ScenarioFieldConfigSchema

    fetchMock.putOnce(`/scenariofieldconfigs/${configId}/info`, config)

    yield sdkFetch
      .updateScenarioFieldConfig(configId, config)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(config)
      })
  })

  it('should update ScenarioField list of ScenarioFieldConfig', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const fields = [{ fieldType: 'tag' }] as ScenarioFieldSchema[]

    fetchMock.putOnce(
      `/scenariofieldconfigs/${configId}/scenariofields`,
      fields
    )

    yield sdkFetch
      .updateScenarioFieldConfigFields(configId, fields)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(fields)
      })
  })

  it('should return Boolean as the validation result', function*() {
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const name = 'mock-sfc-name'
    const resp = { exists: true }

    fetchMock.once(
      `/scenariofieldconfigs/name/verify?_organizationId=${orgId}&objectType=${objectType}&name=${name}&_=666`,
      resp
    )

    yield sdkFetch
      .verifyOrgScenarioFieldConfigName(orgId, objectType, name)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(resp)
      })
  })
})

describe('ScenarioFieldConfigApi spec: ', () => {
  let sdk: SDK

  before(() => {
    SDKFetch.fetchTail = '666'
  })

  after(() => {
    SDKFetch.fetchTail = undefined
  })

  beforeEach(() => {
    sdk = createSdk()
    sdk.fetch.setAPIHost('')
  })

  afterEach(() => {
    fetchMock.restore()
  })

  const assertScenarioFieldConfig = (
    actual: any,
    expected: any,
    { withCustomfields = false } = {}
  ) => {
    // 除 scenariofields 之外
    expectToDeepEqualForFieldsOfTheExpected(actual, expected, 'scenariofields')

    // 单独对 scenariofields 做断言
    actual.scenariofields.forEach((scenarioField: any, index: number) => {
      const scenarioFieldExpected = expected.scenariofields[index]

      // 除 customfield 之外
      expectToDeepEqualForFieldsOfTheExpected(
        scenarioField,
        scenarioFieldExpected,
        'customfield'
      )

      // 断言 customfield 数据存在
      if (withCustomfields && scenarioField.fieldType === 'customfield') {
        expectToDeepEqualForFieldsOfTheExpected(
          scenarioField.customfield,
          scenarioFieldExpected.customfield
        )
      }
    })
  }

  it('should return a TaskScenarioFieldConfig array', function*() {
    const projectId = taskScenarioFieldConfig._projectId as ProjectId
    const configs = [
      { ...taskScenarioFieldConfig, taskflowstatuses: undefined }
    ]

    fetchMock.getOnce('*', configs)

    yield sdk
      .getScenarioFieldConfigs(projectId, 'task')
      .take(1)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })
  })

  it('should return a TaskScenarioFieldConfig array with CustomField', function*() {
    const projectId = taskScenarioFieldConfig._projectId as ProjectId
    const configs = [
      { ...taskScenarioFieldConfig, taskflowstatuses: undefined }
    ]

    fetchMock.getOnce('*', configs)

    yield sdk
      .getScenarioFieldConfigs(projectId, 'task', { withCustomfields: true })
      .take(1)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0], {
          withCustomfields: true
        })
      })
  })

  it('should return an EventScenarioFieldConfig array', function*() {
    const projectId = eventScenarioFieldConfig._projectId as ProjectId
    const configs = [eventScenarioFieldConfig]

    fetchMock.getOnce('*', configs)

    yield sdk
      .getScenarioFieldConfigs(projectId, 'event')
      .take(1)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })
  })

  it('should return a TaskScenarioFieldConfig array bound to Organization', function*() {
    const organizationId = orgTaskScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [
      { ...orgTaskScenarioFieldConfig, taskflowstatuses: undefined }
    ]

    fetchMock.getOnce('*', { result: configs })

    yield sdk
      .getOrgScenarioFieldConfigs(organizationId, 'task')
      .take(1)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })
  })

  it('should return an EventScenarioFieldConfig array bound to Organization', function*() {
    const organizationId = orgEventScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgEventScenarioFieldConfig]

    fetchMock.getOnce('*', { result: configs })

    yield sdk
      .getOrgScenarioFieldConfigs(organizationId, 'event')
      .take(1)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })
  })

  it('should add a TaskScenarioFieldConfig array to Project', function*() {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId
    const config = {
      ...taskScenarioFieldConfig,
      _id: configId,
      taskflowstatuses: undefined
    }
    const projectId = config._boundToObjectId as ProjectId
    const configIds = [configId]
    const configs = [config]

    fetchMock.getOnce('*', [])

    const configs$ = sdk
      .getScenarioFieldConfigs(projectId, 'task')
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do((result) => {
      expect(result).to.be.empty
    })

    fetchMock.postOnce('*', configs)

    yield sdk
      .bulkAddScenarioFieldConfigs(projectId, 'task', configIds)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, configs[0])
    })
  })

  it('should add an EventScenarioFieldConfig array to Project', function*() {
    const configId = 'mock-event-sf-config-id' as ScenarioFieldConfigId
    const config = { ...eventScenarioFieldConfig, _id: configId }
    const projectId = config._boundToObjectId as ProjectId
    const configIds = [configId]
    const configs = [config]

    fetchMock.getOnce('*', [])

    const configs$ = sdk
      .getScenarioFieldConfigs(projectId, 'event')
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do((result) => {
      expect(result).to.be.empty
    })

    fetchMock.postOnce('*', configs)

    yield sdk
      .bulkAddScenarioFieldConfigs(projectId, 'event', configIds)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, configs[0])
    })
  })

  it('should restore ScenarioFieldConfig to the Base', function*() {
    const configId = 'mock-event-sf-config-id' as ScenarioFieldConfigId
    const config = { ...eventScenarioFieldConfig, _id: configId }
    const configBase = { ...config, name: 'mock-event-sf-config-name' }
    const projectId = config._boundToObjectId as ProjectId
    const configs = [config]
    const configsBase = [configBase]

    fetchMock.getOnce('*', configs)

    const configs$ = sdk
      .getScenarioFieldConfigs(projectId, 'event')
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, configs[0])
    })

    fetchMock.putOnce('*', configBase)

    yield sdk
      .restoreScenarioFieldConfig(configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        assertScenarioFieldConfig(result, configBase)
      })

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, configsBase[0])
    })
  })

  it('should save ScenarioFieldConfig as the Base', function*() {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId

    fetchMock.putOnce('*', {})

    yield sdk
      .syncScenarioFieldConfig(configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal({ _id: configId })
      })
  })

  it('should create a new ScenarioFieldConfig', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const config = {
      _id: configId,
      _boundToObjectId: orgId,
      objectType,
      scenariofields: []
    }

    fetchMock.once('*', { result: [] })

    const configs$ = sdk
      .getOrgScenarioFieldConfigs(orgId, objectType)
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do((result) => {
      expect(result).to.deep.equal([])
    })

    fetchMock.once('*', config)

    yield sdk
      .createOrgScenarioFieldConfig(orgId, {
        _boundToObjectId: orgId,
        objectType
      } as any)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(config)
      })

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, config)
    })
  })

  it('should delete ScenarioFieldConfig', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const config = {
      _id: configId,
      _boundToObjectId: orgId,
      objectType,
      scenariofields: [{ fieldType: 'tag' }] as ScenarioFieldSchema[]
    } as ScenarioFieldConfigSchema

    fetchMock.getOnce('*', { result: [config] })

    const configs$ = sdk
      .getOrgScenarioFieldConfigs(orgId, objectType)
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, config)
    })

    fetchMock.deleteOnce('*', {})

    yield sdk
      .deleteOrgScenarioFieldConfig(orgId, configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal({})
      })

    yield configs$.do((result) => {
      expect(result).to.be.empty
    })
  })

  it('should update ScenarioFieldConfig bound to Organization', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const config = {
      _id: configId,
      _boundToObjectId: orgId,
      objectType,
      scenariofields: [{ fieldType: 'tag' }] as ScenarioFieldSchema[]
    } as ScenarioFieldConfigSchema

    fetchMock.getOnce('*', { result: [config] })

    const configs$ = sdk
      .getOrgScenarioFieldConfigs(orgId, objectType)
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, config)
    })

    const nextConfigName = 'mock-sfc-name-new'
    const nextConfig: Partial<ScenarioFieldConfigSchema> = {
      _id: configId,
      name: nextConfigName
    }

    fetchMock.putOnce('*', nextConfig)

    yield sdk
      .updateScenarioFieldConfig(configId, { name: nextConfigName })
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(nextConfig)
      })

    yield configs$.do(([result]) => {
      expect(result.name).to.equal(nextConfigName)
      assertScenarioFieldConfig(result, { ...config, ...nextConfig })
    })
  })

  it('should update ScenarioFieldConfig bound to Project', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const projectId = 'mock-project-id' as ProjectId
    const objectType = 'task'
    const config = {
      _id: configId,
      _boundToObjectId: projectId,
      objectType,
      scenariofields: [{ fieldType: 'tag' }] as ScenarioFieldSchema[]
    } as ScenarioFieldConfigSchema

    fetchMock.getOnce('*', [config])

    const configs$ = sdk
      .getScenarioFieldConfigs(projectId, objectType)
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, config)
    })

    const nextConfigName = 'mock-sfc-name-new'
    const nextConfig: Partial<ScenarioFieldConfigSchema> = {
      _id: configId,
      name: nextConfigName
    }

    fetchMock.putOnce('*', nextConfig)

    yield sdk
      .updateScenarioFieldConfig(configId, { name: nextConfigName })
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(nextConfig)
      })

    yield configs$.do(([result]) => {
      expect(result.name).to.equal(nextConfigName)
      assertScenarioFieldConfig(result, { ...config, ...nextConfig })
    })
  })

  it('should update ScenarioField list of ScenarioFieldConfig bound to Organization', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const config = {
      _id: configId,
      _boundToObjectId: orgId,
      objectType,
      scenariofields: [{ fieldType: 'tag' }] as ScenarioFieldSchema[]
    } as ScenarioFieldConfigSchema

    fetchMock.getOnce('*', { result: [config] })

    const configs$ = sdk
      .getOrgScenarioFieldConfigs(orgId, objectType, { withCustomfields: true })
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, config, { withCustomfields: true })
    })

    const customFieldId = 'mock-cf-id' as CustomFieldId
    const customField = { _id: customFieldId } as CustomFieldSchema
    const nextScenarioField = {
      fieldType: 'customfield',
      _customfieldId: customFieldId
    } as CustomScenarioFieldSchema
    const nextConfig: Partial<ScenarioFieldConfigSchema> = {
      _id: configId,
      scenariofields: [nextScenarioField]
    }

    fetchMock.putOnce('*', nextConfig)

    yield sdk
      .updateScenarioFieldConfigFields(configId, [nextScenarioField])
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(nextConfig)
      })

    fetchMock.getOnce('*', customField)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(
        result,
        {
          ...config,
          scenariofields: [{ ...nextScenarioField, customfield: customField }]
        },
        { withCustomfields: true }
      )
    })
  })

  it('should update ScenarioField list of ScenarioFieldConfig bound to Project', function*() {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const projectId = 'mock-project-id' as ProjectId
    const objectType = 'task'
    const config = {
      _id: configId,
      _boundToObjectId: projectId,
      objectType,
      scenariofields: [{ fieldType: 'tag' }] as ScenarioFieldSchema[]
    } as ScenarioFieldConfigSchema

    fetchMock.getOnce('*', [config])

    const configs$ = sdk
      .getScenarioFieldConfigs(projectId, objectType, {
        withCustomfields: true
      })
      .take(1)
      .subscribeOn(Scheduler.asap)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, config, { withCustomfields: true })
    })

    const customFieldId = 'mock-cf-id' as CustomFieldId
    const customField = { _id: customFieldId } as CustomFieldSchema
    const customFieldLink = {
      _id: 'mock-cfl-id',
      _customfieldId: customFieldId
    } as CustomFieldLinkSchema
    const nextScenarioField = {
      fieldType: 'customfield',
      _customfieldId: customFieldId
    } as CustomScenarioFieldSchema
    const nextConfig: Partial<ScenarioFieldConfigSchema> = {
      _id: configId,
      scenariofields: [nextScenarioField]
    }

    fetchMock.putOnce('*', nextConfig)

    yield sdk
      .updateScenarioFieldConfigFields(configId, [nextScenarioField])
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(nextConfig)
      })

    const customfieldlinksUrl = `/projects/${projectId}/customfieldlinks?boundType=application&_=666`
    fetchMock.getOnce(customfieldlinksUrl, [customFieldLink])

    // 缓存 CustomFieldLink 数据
    yield sdk
      .getCustomFieldLinks(projectId, 'application')
      .values()
      .subscribeOn(Scheduler.asap)
      .do(() => {
        expect(fetchMock.called(customfieldlinksUrl)).to.be.true
      })

    // 请求 CustomField 数据，无权限
    const customFieldUrl = `/customfields/${customFieldId}?_=666`
    fetchMock.getOnce(customFieldUrl, 403)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(
        result,
        {
          ...config,
          ...nextConfig,
          scenariofields: [{ ...nextScenarioField, customfield: customField }]
        },
        { withCustomfields: true }
      )

      expect(fetchMock.called(customFieldUrl)).to.be.true
    })
  })
})
