import { describe, before, beforeEach, afterEach, it, after } from 'tman'
import { Scheduler } from 'rxjs'
import { expect } from 'chai'

import { SDKFetch, createSdk, SDK } from '../'
import {
  taskScenarioFieldConfig,
  eventScenarioFieldConfig,
  orgTaskScenarioFieldConfig,
  orgEventScenarioFieldConfig
} from '../fixtures/scenariofieldconfigs.fixture'
import { mock, expectToDeepEqualForFieldsOfTheExpected } from '../utils'
import { OrganizationId, ProjectId, ScenarioFieldConfigId } from 'teambition-types'

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

  it('should return a TaskScenarioFieldConfig array', function* () {
    const projectId = taskScenarioFieldConfig._projectId as ProjectId
    const configs = [taskScenarioFieldConfig]
    const url = `/projects/${projectId}/scenariofieldconfigs?objectType=task&withTaskflowstatus=true&_=666`

    fetchMock.once(url, configs)

    yield sdkFetch.getScenarioFieldConfigs(projectId, 'task', { withTaskflowstatus: true })
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should return an EventScenarioFieldConfig array', function* () {
    const projectId = eventScenarioFieldConfig._projectId as ProjectId
    const configs = [eventScenarioFieldConfig]
    const url = `/projects/${projectId}/scenariofieldconfigs?objectType=event&withTaskflowstatus=true&_=666`

    fetchMock.once(url, configs)

    yield sdkFetch.getScenarioFieldConfigs(projectId, 'event', { withTaskflowstatus: true })
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should return a TaskScenarioFieldConfig array bound to Organization', function* () {
    const orgId = orgTaskScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgTaskScenarioFieldConfig]
    const url = `/organizations/${orgId}/scenariofieldconfigs?sort=project_desc&objectType=task&_=666`

    fetchMock.once(url, { result: configs, nextPageToken: '' })

    yield sdkFetch.getOrgScenarioFieldConfigs(orgId, 'task', { sort: 'project_desc' })
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should return an EventScenarioFieldConfig array bound to Organization', function* () {
    const orgId = orgEventScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgEventScenarioFieldConfig]
    const url = `/organizations/${orgId}/scenariofieldconfigs?objectType=event&_=666`

    fetchMock.once(url, { result: configs, nextPageToken: '' })

    yield sdkFetch.getOrgScenarioFieldConfigs(orgId, 'event')
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should add a TaskScenarioFieldConfig array to Project', function* () {
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

    yield sdkFetch.bulkAddScenarioFieldConfigs(projectId, 'task', configIds)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(configs)
      })
  })

  it('should add an EventScenarioFieldConfig array to Project', function* () {
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

    yield sdkFetch.bulkAddScenarioFieldConfigs(projectId, 'event', configIds)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(configs)
      })
  })

  it('should restore ScenarioFieldConfig to the Base', function* () {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId
    const config = { ...taskScenarioFieldConfig, _id: configId }

    fetchMock.putOnce(`/scenariofieldconfigs/${configId}/restore`, config)

    yield sdkFetch.restoreScenarioFieldConfig(configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(config)
      })
  })

  it('should save ScenarioFieldConfig as the Base', function* () {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId

    fetchMock.putOnce(`/scenariofieldconfigs/${configId}/sync`, {})

    yield sdkFetch.syncScenarioFieldConfig(configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal({})
      })
  })

  it('should return an array of Project using the ScenarioFieldConfig', function* () {
    const sfcId = 'mock-sf-config-id' as ScenarioFieldConfigId
    const resp = { totalSize: 10, result: ['p1', 'p2'] }

    fetchMock.once(`/scenariofieldconfigs/${sfcId}/projects?_=666`, resp)

    yield sdkFetch.getOrgScenarioFieldConfigProjects(sfcId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(resp)
      })
  })

  it('should create a new ScenarioFieldConfig', function* () {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const config = { ...orgTaskScenarioFieldConfig, _id: configId } as any
    const orgId = config._boundToObjectId as OrganizationId

    fetchMock.postOnce(`/organizations/${orgId}/scenariofieldconfigs`, config)

    yield sdkFetch.createOrgScenarioFieldConfig(orgId, config)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(config)
      })
  })

  it('should return Boolean as the validation result', function* () {
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const name = 'mock-sfc-name'
    const resp = { exists: true }

    fetchMock.once(
      `/scenariofieldconfigs/name/verify?_organizationId=${orgId}&objectType=${objectType}&name=${name}&_=666`,
      resp
    )

    yield sdkFetch.verifyOrgScenarioFieldConfigName(orgId, objectType, name)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(resp)
      })
  })
})

describe('ScenarioFieldConfigApi spec: ', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, schedule?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  afterEach(() => {
    fetchMock.restore()
  })

  const assertScenarioFieldConfig = (
    actual: any,
    expected: any,
    { withCustomfields = false } = {}
  ) => {
    expectToDeepEqualForFieldsOfTheExpected(actual, expected, 'scenariofields')

    actual.scenariofields.forEach((sf: any, index: number) => {
      expectToDeepEqualForFieldsOfTheExpected(
        sf,
        expected.scenariofields[index],
        'customfield'
      )

      // 断言 customfield 数据存在
      const customfieldExpected = expected.scenariofields[index].customfield
      if (withCustomfields && sf.fieldType === 'customfield') {
        expectToDeepEqualForFieldsOfTheExpected(
          customfieldExpected,
          sf.customfield
        )
      }
    })
  }

  it('should return a TaskScenarioFieldConfig array', function* () {
    const projectId = taskScenarioFieldConfig._projectId as ProjectId
    const configs = [{ ...taskScenarioFieldConfig, taskflowstatuses: undefined }]

    mockResponse(configs)

    yield sdk.getScenarioFieldConfigs(projectId, 'task')
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })
  })

  it('should return a TaskScenarioFieldConfig array with CustomField', function* () {
    const projectId = taskScenarioFieldConfig._projectId as ProjectId
    const configs = [{ ...taskScenarioFieldConfig, taskflowstatuses: undefined }]

    mockResponse(configs)

    yield sdk.getScenarioFieldConfigs(projectId, 'task', { withCustomfields: true })
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0], { withCustomfields: true })
      })
  })

  it('should return an EventScenarioFieldConfig array', function* () {
    const projectId = eventScenarioFieldConfig._projectId as ProjectId
    const configs = [eventScenarioFieldConfig]

    mockResponse(configs)

    yield sdk.getScenarioFieldConfigs(projectId, 'event')
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })
  })

  it('should return a TaskScenarioFieldConfig array bound to Organization', function* () {
    const organizationId = orgTaskScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [{ ...orgTaskScenarioFieldConfig, taskflowstatuses: undefined }]

    mockResponse({ result: configs })

    yield sdk.getOrgScenarioFieldConfigs(organizationId, 'task')
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })
  })

  it('should return an EventScenarioFieldConfig array bound to Organization', function* () {
    const organizationId = orgEventScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgEventScenarioFieldConfig]

    mockResponse({ result: configs })

    yield sdk.getOrgScenarioFieldConfigs(organizationId, 'event')
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        assertScenarioFieldConfig(result, configs[0])
      })
  })

  it('should add a TaskScenarioFieldConfig array to Project', function* () {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId
    const config = { ...taskScenarioFieldConfig, _id: configId, taskflowstatuses: undefined }
    const projectId = config._boundToObjectId as ProjectId
    const configIds = [configId]
    const configs = [config]

    mockResponse([])

    const configs$ = sdk.getScenarioFieldConfigs(projectId, 'task')
      .values()
      .subscribeOn(Scheduler.asap)

    yield configs$.do((result) => {
      expectToDeepEqualForFieldsOfTheExpected(result, [])
    })

    mockResponse(configs)

    yield sdk.bulkAddScenarioFieldConfigs(projectId, 'task', configIds)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        expectToDeepEqualForFieldsOfTheExpected(result, configs[0])
      })

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, configs[0])
    })
  })

  it('should add an EventScenarioFieldConfig array to Project', function* () {
    const configId = 'mock-event-sf-config-id' as ScenarioFieldConfigId
    const config = { ...eventScenarioFieldConfig, _id: configId }
    const projectId = config._boundToObjectId as ProjectId
    const configIds = [configId]
    const configs = [config]

    mockResponse([])

    const configs$ = sdk.getScenarioFieldConfigs(projectId, 'event')
      .values()
      .subscribeOn(Scheduler.asap)

    yield configs$.do((result) => {
      expectToDeepEqualForFieldsOfTheExpected(result, [])
    })

    mockResponse(configs)

    yield sdk.bulkAddScenarioFieldConfigs(projectId, 'event', configIds)
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        expectToDeepEqualForFieldsOfTheExpected(result, configs[0])
      })

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, configs[0])
    })
  })

  it('should restore ScenarioFieldConfig to the Base', function* () {
    const configId = 'mock-event-sf-config-id' as ScenarioFieldConfigId
    const config = { ...eventScenarioFieldConfig, _id: configId }
    const configBase = { ...config, name: 'mock-event-sf-config-name' }
    const projectId = config._boundToObjectId as ProjectId
    const configs = [config]
    const configsBase = [configBase]

    mockResponse(configs)

    const configs$ = sdk.getScenarioFieldConfigs(projectId, 'event')
      .values()
      .subscribeOn(Scheduler.asap)

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, configs[0])
    })

    mockResponse(configBase)

    yield sdk.restoreScenarioFieldConfig(configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expectToDeepEqualForFieldsOfTheExpected(result, configBase)
      })

    yield configs$.do(([result]) => {
      assertScenarioFieldConfig(result, configsBase[0])
    })
  })

  it('should save ScenarioFieldConfig as the Base', function* () {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId

    mockResponse({})

    yield sdk.syncScenarioFieldConfig(configId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal({ _id: configId })
      })
  })

  it('should create a new ScenarioFieldConfig', function* () {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const config = { _id: configId, _boundToObjectId: orgId, objectType, scenariofields: [] }

    fetchMock.once('*', { result: [] })
    mockResponse([])

    const configs$ = sdk.getOrgScenarioFieldConfigs(orgId, objectType)
      .values()
      .subscribeOn(Scheduler.asap)

    yield configs$.do((result) => {
      expect(result).to.deep.equal([])
    })

    fetchMock.once('*', config)
    mockResponse(config)

    yield sdk.createOrgScenarioFieldConfig(orgId, { _boundToObjectId: orgId, objectType } as any)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(config)
      })

    yield configs$.do(([result]) => {
      expectToDeepEqualForFieldsOfTheExpected(result, config)
    })
  })
})
