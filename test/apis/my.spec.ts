import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'tman'
import { tap } from 'rxjs/operators'
import { createSdk, SDK, TaskSchema } from '../index'
import { EventGenerator } from '../../src/apis/event/EventGenerator'
import * as Fixture from '../fixtures/my.fixture'
import { mock, restore, expectToDeepEqualForFieldsOfTheExpected } from '../utils'
import { UserId } from 'teambition-types'

describe('MyApi request spec', () => {
  const userId = Fixture.myRecent[0]['_executorId'] as UserId
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('should get my recent data', function* () {
    mockResponse(Fixture.myRecent)

    const token = sdk.getMyRecent(userId, {
      dueDate: '2017-02-13T03:38:54.252Z',
      startDate: '2016-12-31T16:00:00.000Z'
    })

    yield token.values()
      .pipe(tap(r => {
        const compareFn = (x: any, y: any) => {
          return new Date(x.updated).valueOf() - new Date(y.updated).valueOf()
            + new Date(x.created).valueOf() - new Date(y.created).valueOf()
        }
        const expected = Fixture.norm(Fixture.myRecent).sort(compareFn)
        const actual = r.map(_r => {
          if (_r.type === 'task') {
            if (!(_r as TaskSchema).recurrence) {
              delete (_r as TaskSchema)._sourceId
              delete (_r as TaskSchema).recurrence
              delete (_r as TaskSchema).sourceDate
            }
            if (!(_r as TaskSchema).uniqueId) {
              delete (_r as TaskSchema).uniqueId
            }
          }
          if (_r instanceof EventGenerator) {
            return (_r as EventGenerator).next().value!
          }
          return _r
        })
          .sort(compareFn)

        expected.forEach((expectedResult, i) => {
          expectToDeepEqualForFieldsOfTheExpected(actual[i], expectedResult)
        })
      }))
  })

  it('should get my count', function* () {
    mockResponse(Fixture.count)

    const ret = yield sdk.getMyCount()
    expect(ret).is.deep.equal(Fixture.count)
  })
})
