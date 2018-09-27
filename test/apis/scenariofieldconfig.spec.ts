import { describe, before, beforeEach, afterEach, it, after } from 'tman'
import { expect } from 'chai'

import { SDKFetch, createSdk, SDK } from '../'
import {
  taskScenarioFieldConfig,
  eventScenarioFieldConfig,
  orgTaskScenarioFieldConfig,
  orgEventScenarioFieldConfig
} from '../fixtures/scenariofieldconfigs.fixture'
import { mock, expectToDeepEqualForFieldsOfTheExpected, tapAsap } from '../utils'
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

    yield sdkFetch.getScenarioFieldConfigs(projectId, 'task', true)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(configs))))
  })

  it('should return an EventScenarioFieldConfig array', function* () {
    const projectId = eventScenarioFieldConfig._projectId as ProjectId
    const configs = [eventScenarioFieldConfig]
    const url = `/projects/${projectId}/scenariofieldconfigs?objectType=event&withTaskflowstatus=true&_=666`

    fetchMock.once(url, configs)

    yield sdkFetch.getScenarioFieldConfigs(projectId, 'event', true)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(configs))))
  })

  it('should return a TaskScenarioFieldConfig array bound to Organization', function* () {
    const orgId = orgTaskScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgTaskScenarioFieldConfig]
    const url = `/organizations/${orgId}/scenariofieldconfigs?sort=project_desc&objectType=task&_=666`

    fetchMock.once(url, { result: configs, nextPageToken: '' })

    yield sdkFetch.getOrgScenarioFieldConfigs(orgId, 'task', { sort: 'project_desc' })
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(configs))))
  })

  it('should return an EventScenarioFieldConfig array bound to Organization', function* () {
    const orgId = orgEventScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgEventScenarioFieldConfig]
    const url = `/organizations/${orgId}/scenariofieldconfigs?objectType=event&_=666`

    fetchMock.once(url, { result: configs, nextPageToken: '' })

    yield sdkFetch.getOrgScenarioFieldConfigs(orgId, 'event')
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(configs))))
  })

  it('should add a TaskScenarioFieldConfig array to Project', function* () {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId
    const config = { ...taskScenarioFieldConfig, _id: configId }
    const projectId = config._boundToObjectId as ProjectId
    const configIds = [configId]
    const configs = [config]

    fetchMock.postOnce((url: string, opts: any) => {
      return url === `/projects/${projectId}/scenariofieldconfigs/bulk` &&
        opts.body.objectType === 'task'
    }, configs)

    yield sdkFetch.bulkAddScenarioFieldConfigs(projectId, 'task', configIds)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(configs))))
  })

  it('should add an EventScenarioFieldConfig array to Project', function* () {
    const configId = 'mock-event-sf-config-id' as ScenarioFieldConfigId
    const config = { ...eventScenarioFieldConfig, _id: configId }
    const projectId = config._boundToObjectId as ProjectId
    const configIds = [configId]
    const configs = [config]

    fetchMock.postOnce((url: string, opts: any) => {
      return url === `/projects/${projectId}/scenariofieldconfigs/bulk` &&
        opts.body.objectType === 'event'
    }, configs)

    yield sdkFetch.bulkAddScenarioFieldConfigs(projectId, 'event', configIds)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(configs))))
  })

  it('should restore ScenarioFieldConfig to the Base', function* () {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId
    const config = { ...taskScenarioFieldConfig, _id: configId }

    fetchMock.putOnce(`/scenariofieldconfigs/${configId}/restore`, config)

    yield sdkFetch.restoreScenarioFieldConfig(configId)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(config))))
  })

  it('should save ScenarioFieldConfig as the Base', function* () {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId

    fetchMock.putOnce(`/scenariofieldconfigs/${configId}/sync`, {})

    yield sdkFetch.syncScenarioFieldConfig(configId)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal({}))))
  })

  it('should return an array of Project using the ScenarioFieldConfig', function* () {
    const sfcId = 'mock-sf-config-id' as ScenarioFieldConfigId
    const resp = { totalSize: 10, result: ['p1', 'p2'] }

    fetchMock.once(`/scenariofieldconfigs/${sfcId}/projects?_=666`, resp)

    yield sdkFetch.getOrgScenarioFieldConfigProjects(sfcId)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(resp))))
  })

  it('should create a new ScenarioFieldConfig', function* () {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const config = { ...orgTaskScenarioFieldConfig, _id: configId } as any
    const orgId = config._boundToObjectId as OrganizationId

    fetchMock.postOnce(`/organizations/${orgId}/scenariofieldconfigs`, config)

    yield sdkFetch.createOrgScenarioFieldConfig(orgId, config)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(config))))
  })

  it('should return Boolean as the validation result', function* () {
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const name = 'mock-sfc-name'
    const resp = { exists: true }

    fetchMock.once(`/scenariofieldconfigs/name/verify?_organizationId=${orgId}&objectType=${objectType}&name=${name}&_=666`, resp)

    yield sdkFetch.verifyOrgScenarioFieldConfigName(
      orgId,
      objectType,
      name
    )
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(resp))))
  })
})

describe('ScenarioFieldConfigApi spec: ', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, schedule?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  it('should return a TaskScenarioFieldConfig array', function* () {
    const projectId = taskScenarioFieldConfig._projectId as ProjectId
    const configs = [{ ...taskScenarioFieldConfig, taskflowstatuses: undefined }]

    mockResponse(configs)

    yield sdk.getScenarioFieldConfigs(projectId, 'task')
      .values()
      .pipe(tapAsap((([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0]))))
  })

  it('should return an EventScenarioFieldConfig array', function* () {
    const projectId = eventScenarioFieldConfig._projectId as ProjectId
    const configs = [eventScenarioFieldConfig]

    mockResponse(configs)

    yield sdk.getScenarioFieldConfigs(projectId, 'event')
      .values()
      .pipe(tapAsap((([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0]))))
  })

  it('should return a TaskScenarioFieldConfig array bound to Organization', function* () {
    const organizationId = orgTaskScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [{ ...orgTaskScenarioFieldConfig, taskflowstatuses: undefined }]

    mockResponse({ result: configs })

    yield sdk.getOrgScenarioFieldConfigs(organizationId, 'task')
      .values()
      .pipe(tapAsap((([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0]))))
  })

  it('should return an EventScenarioFieldConfig array bound to Organization', function* () {
    const organizationId = orgEventScenarioFieldConfig._boundToObjectId as OrganizationId
    const configs = [orgEventScenarioFieldConfig]

    mockResponse({ result: configs })

    yield sdk.getOrgScenarioFieldConfigs(organizationId, 'event')
      .values()
      .pipe(tapAsap((([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0]))))
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

    yield configs$
      .pipe(tapAsap((result) => expectToDeepEqualForFieldsOfTheExpected(result, [])))

    mockResponse(configs)

    yield sdk.bulkAddScenarioFieldConfigs(projectId, 'task', configIds)
      .pipe(tapAsap((([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0]))))

    yield configs$
      .pipe(tapAsap(([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0])))
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

    yield configs$
      .pipe(tapAsap(((result) => expectToDeepEqualForFieldsOfTheExpected(result, []))))

    mockResponse(configs)

    yield sdk.bulkAddScenarioFieldConfigs(projectId, 'event', configIds)
      .pipe(tapAsap((([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0]))))

    yield configs$
      .pipe(tapAsap(([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0])))
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

    yield configs$
      .pipe(tapAsap((([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configs[0]))))

    mockResponse(configBase)

    yield sdk.restoreScenarioFieldConfig(configId)
      .pipe(tapAsap(((result) => expectToDeepEqualForFieldsOfTheExpected(result, configBase))))

    yield configs$
      .pipe(tapAsap(([result]) => expectToDeepEqualForFieldsOfTheExpected(result, configsBase[0])))
  })

  it('should save ScenarioFieldConfig as the Base', function* () {
    const configId = 'mock-task-sf-config-id' as ScenarioFieldConfigId

    mockResponse({})

    yield sdk.syncScenarioFieldConfig(configId)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal({ _id: configId }))))
  })

  it('should create a new ScenarioFieldConfig', function* () {
    const configId = 'mock-sfc-id' as ScenarioFieldConfigId
    const orgId = 'mock-org-id' as OrganizationId
    const objectType = 'task'
    const config = { _id: configId, _boundToObjectId: orgId, objectType }

    mockResponse([])

    const configs$ = sdk.getOrgScenarioFieldConfigs(orgId, objectType)
      .values()

    yield configs$
      .pipe(tapAsap(((result) => expect(result).to.deep.equal([]))))

    mockResponse(config)

    yield sdk.createOrgScenarioFieldConfig(orgId, { _boundToObjectId: orgId, objectType } as any)
      .pipe(tapAsap(((result) => expect(result).to.deep.equal(config))))

    yield configs$
      .pipe(tapAsap(([result]) => expectToDeepEqualForFieldsOfTheExpected(result, config)))
  })
})
