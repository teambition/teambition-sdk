import { describe, it, beforeEach, afterEach } from 'tman'
import { expect } from 'chai'
import { createSdk, SocketMock, SDK, TaskData } from '../index'
import * as Fixture from '../fixtures/my.fixture'
import { mock, restore } from '../utils'

describe('MyApi Spec', () => {
  const userId = Fixture.myRecent[0]['_executorId']
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  describe('MyApi request Spec', () => {
    it('should get my recent data', function* () {
      mockResponse(Fixture.myRecent)

      const token = sdk.getMyRecent(userId, {
        dueDate: '2017-02-13T03:38:54.252Z',
        startDate: '2016-12-31T16:00:00.000Z'
      })

      yield token.values()
        .do(r => {
          const compareFn = (x, y) => {
            return new Date(x.updated).valueOf() - new Date(y.updated).valueOf()
             + new Date(x.created).valueOf() - new Date(y.created).valueOf()
          }
          const actual = r.sort(compareFn)
            .map(_r => {
              if (_r.type === 'task') {
                if (!(_r as TaskData).recurrence) {
                  delete (_r as TaskData)._sourceId
                  delete (_r as TaskData).recurrence
                  delete (_r as TaskData).sourceDate
                }
                if (!(_r as TaskData).uniqueId) {
                  delete (_r as TaskData).uniqueId
                }
              }
              return _r
            })
          const expected = Fixture.myRecent.sort(compareFn)
          expect(actual).to.deep.equal(expected)
        })
    })
  })
})
