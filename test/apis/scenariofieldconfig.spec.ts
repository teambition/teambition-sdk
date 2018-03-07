import { describe, before, beforeEach, afterEach, it, after } from 'tman'
import { Scheduler } from 'rxjs'
import { expect } from 'chai'

import { SDKFetch, createSdk, SDK } from '../'
import { taskScenariofieldConfig, eventScenariofieldConfig } from '../fixtures/scenariofieldconfigs.fixture'
import { mock, expectToDeepEqualForFieldsOfTheExpected } from '../utils'

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

  it('should return a TaskScenariofieldConfig array', function* () {
    const projectId = taskScenariofieldConfig._projectId
    const configs = [taskScenariofieldConfig]
    const url = `/projects/${projectId}/scenariofieldconfigs?objectType=task&withTaskflowstatus=true&_=666`

    fetchMock.once(url, configs)

    yield sdkFetch.getScenarioFieldConfigs(projectId, 'task', true)
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })

  it('should return an EventScenariofieldConfig array', function* () {
    const projectId = eventScenariofieldConfig._projectId
    const configs = [eventScenariofieldConfig]
    const url = `/projects/${projectId}/scenariofieldconfigs?objectType=event&withTaskflowstatus=true&_=666`

    fetchMock.once(url, configs)

    yield sdkFetch.getScenarioFieldConfigs(projectId, 'event', true)
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(configs))
  })
})

describe('ScenarioFieldConfigApi spec: ', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, schedule?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  it('should return a TaskScenariofieldConfig array', function* () {
    const projectId = taskScenariofieldConfig._projectId
    const configs = [{
      ...taskScenariofieldConfig,
      taskflowstatuses: undefined
    }]
    mockResponse(configs)

    yield sdk.getScenarioFieldConfigs(projectId, 'task')
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        expectToDeepEqualForFieldsOfTheExpected(result, configs[0])
      })
  })

  it('should return an EventScenariofieldConfig array', function* () {
    const projectId = eventScenariofieldConfig._projectId
    const configs = [eventScenariofieldConfig]
    mockResponse(configs)

    yield sdk.getScenarioFieldConfigs(projectId, 'event')
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        expectToDeepEqualForFieldsOfTheExpected(result, configs[0])
      })
  })
})
