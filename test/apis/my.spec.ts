import { describe, it, beforeEach, afterEach } from 'tman'
import { expect } from 'chai'
import { createSdk, SocketMock, SDK, TaskSchema } from '../index'
import { EventGenerator } from '../../src/apis/event/EventGenerator'
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
              return _r.next().value
            }
            return _r
          })
          .sort(compareFn)

          expect(actual).to.deep.equal(expected)
        })
    })

    it('should get my count', function* () {
      mockResponse(Fixture.count)

      const ret = yield sdk.getMyCount()
      expect(ret).is.deep.equal(Fixture.count)
    })
  })
})
