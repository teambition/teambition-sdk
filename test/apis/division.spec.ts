import { describe, beforeEach, it, afterEach } from 'tman'
import { Scheduler } from 'rxjs'
import { TaskDivisionType, TaskId } from 'teambition-types'
import { SDK, createSdk, TaskSchema, SDKFetch } from '..'
import { mock, expectToDeepEqualForFieldsOfTheExpected } from '../utils'

const fetchMock = require('fetch-mock')

describe('TaskDivision Request', () => {
  let sdkFetch: SDKFetch

  beforeEach(() => {
    sdkFetch = new SDKFetch()
    sdkFetch.setAPIHost('')
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should update Task divisions', function*() {
    const taskId = 'mock-task-id' as TaskId
    const divisions = ['scenariofields'] as TaskDivisionType[]

    const url = `/tasks/${taskId}/divisions`
    fetchMock.putOnce(url, { divisions })

    yield sdkFetch
      .updateTaskDivisions(taskId, divisions)
      .subscribeOn(Scheduler.asap)
      .do((resp) => {
        expectToDeepEqualForFieldsOfTheExpected(resp, { divisions })
      })
  })
})

describe('TaskDivision', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, schedule?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  it('should update Task divisions', function*() {
    const taskId = 'mock-task-id' as TaskId
    const task = { _id: taskId } as TaskSchema
    const divisions = ['scenariofields'] as TaskDivisionType[]

    mockResponse(task)

    yield sdk
      .getTask(taskId)
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([resp]) => {
        expectToDeepEqualForFieldsOfTheExpected(resp, task)
      })

    mockResponse({ divisions })

    yield sdk
      .updateTaskDivisions(taskId, divisions)
      .subscribeOn(Scheduler.asap)
      .do((resp) => {
        expectToDeepEqualForFieldsOfTheExpected(resp, { divisions })
      })

    yield sdk
      .getTask(taskId)
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([resp]) => {
        const nextTask = { ...task, divisions }
        expectToDeepEqualForFieldsOfTheExpected(resp, nextTask)
      })
  })
})
