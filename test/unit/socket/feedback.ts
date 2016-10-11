'use strict'
import * as chai from 'chai'
import { Backend, SocketMock, SocketClient, apihost, FeedbackAPI, clone } from '../index'
import { projectFeedbacks } from '../../mock/projectFeedbacks'
import { flush, expectDeepEqual } from '../utils'

const expect = chai.expect

export default describe('feedback socket: ', () => {
  let Socket: SocketMock
  let httpBackend: Backend
  let FeedbackApi: FeedbackAPI

  const projectId = projectFeedbacks[0]._boundToObjectId
  const from = new Date(2015, 1, 1).toISOString()
  const to = new Date(2017, 1, 1).toISOString()

  beforeEach(() => {
    flush()

    Socket = new SocketMock(SocketClient)
    httpBackend = new Backend()
    FeedbackApi = new FeedbackAPI()
    httpBackend.whenGET(`${apihost}projects/${projectId}/feedbacks?count=1&page=1&from=${from}&to=${to}`)
      .respond(JSON.stringify(projectFeedbacks.slice(0, 1)))
  })

  it('new feedback should ok', function* () {
    const mockFeedback = clone(projectFeedbacks[0])
    mockFeedback._id = 'mockFeedbackid'
    mockFeedback.content.comment = 'mock feedback post'

    const signal = FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .publish()
      .refCount()

    yield Socket.emit('new', 'feedback', '', mockFeedback, signal.take(1))

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(2)
        expectDeepEqual(r[0], mockFeedback)
      })
  })

  it('delete feedback should ok', function* () {
    const feedbackId = projectFeedbacks[0]._id

    const signal = FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .publish()
      .refCount()

    signal.skip(1)
      .subscribe(r => {
        expect(r).to.deep.equal([])
      })

    yield Socket.emit('destroy', 'feedback', feedbackId, null, signal.take(1))

  })

  it('update feedback should ok', function* () {
    const feedbackId = projectFeedbacks[0]._id

    const signal = FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .publish()
      .refCount()

    yield Socket.emit('change', 'feedback', feedbackId, {
      content: {
        comment: 'mock update feedback'
      }
    }, signal.take(1))

    yield signal.take(1)
      .do(r => {
        expect(r[0].content.comment).to.equal('mock update feedback')
      })
  })
})
