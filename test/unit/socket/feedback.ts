'use strict'
import * as chai from 'chai'
import { Backend, SocketMock, apihost, FeedbackAPI, clone } from '../index'
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

    Socket = new SocketMock()
    httpBackend = new Backend()
    FeedbackApi = new FeedbackAPI()
    httpBackend.whenGET(`${apihost}projects/${projectId}/feedbacks?count=1&page=1&from=${from}&to=${to}`)
      .respond(JSON.stringify(projectFeedbacks.slice(0, 1)))
  })

  it('new feedback should ok', done => {
    const mockFeedback = clone(projectFeedbacks[0])
    mockFeedback._id = 'mockFeedbackid'
    mockFeedback.content.comment = 'mock feedback post'

    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(2)
        expectDeepEqual(r[0], mockFeedback)
        done()
      })

    Socket.emit('new', 'feedback', mockFeedback._id, mockFeedback)

    httpBackend.flush()
  })

  it('delete feedback should ok', done => {
    const feedbackId = projectFeedbacks[0]._id

    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .skip(1)
      .subscribe(r => {
        expect(r).to.deep.equal([])
        done()
      })

    Socket.emit('destroy', 'feedback', feedbackId)

    httpBackend.flush()
  })

  it('update feedback should ok', done => {
    const feedbackId = projectFeedbacks[0]._id

    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .skip(1)
      .subscribe(r => {
        expect(r[0].content.comment).to.equal('mock update feedback')
        done()
      })

    Socket.emit('change', 'feedback', feedbackId, {
      content: {
        comment: 'mock update feedback'
      }
    })

    httpBackend.flush()
  })
})
