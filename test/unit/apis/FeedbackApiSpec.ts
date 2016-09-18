'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { Scheduler } from 'rxjs'
import { Backend, apihost, FeedbackAPI, BaseFetch, clone } from '../index'
import { projectFeedbacks } from '../../mock/projectFeedbacks'
import { flush, expectDeepEqual } from '../utils'

const expect = chai.expect
chai.use(SinonChai)

export default describe('FeedbackAPI Spec: ', () => {
  let httpBackend: Backend
  let FeedbackApi: FeedbackAPI
  let spy: Sinon.SinonSpy

  const projectId = projectFeedbacks[0]._boundToObjectId
  const from = new Date(2015, 1, 1).toISOString()
  let to = new Date(2017, 1, 1).toISOString()

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    FeedbackApi = new FeedbackAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')

    httpBackend.whenGET(`${apihost}projects/${projectId}/feedbacks?count=1&page=1&from=${from}&to=${to}`)
      .respond(JSON.stringify(projectFeedbacks.slice(0, 1)))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  it('get projectFeedbacks should ok', done => {
    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .subscribe(r => {
        expectDeepEqual(r[0], projectFeedbacks[0])
        done()
      })
  })

  it('get projectFeedbacks from cache should ok', done => {
    const get = FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })

    get.subscribe()

    get.subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expectDeepEqual(r[0], projectFeedbacks[0])
        expect(spy).to.be.calledOnce
        done()
      })
  })

  it('get projectFeedbacks page 2 should ok', done => {
    httpBackend.whenGET(`${apihost}projects/${projectId}/feedbacks?count=1&page=2&from=${from}&to=${to}`)
      .respond(JSON.stringify(projectFeedbacks.slice(1)))

    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(2)
        expectDeepEqual(r[1], projectFeedbacks[1])
        done()
      })

    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 2,
      from, to
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()
  })

  it('get feedback in another day should ok', done => {

    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from, to
    }).subscribe()

    to = new Date(2016, 12, 1).toISOString()
    httpBackend.whenGET(`${apihost}projects/${projectId}/feedbacks?count=1&page=1&from=${from}&to=${to}`)
      .respond(JSON.stringify(projectFeedbacks.slice(0, 1)))

    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(spy).to.be.calledTwice
        done()
      })

  })

  it('update project feedback should ok', done => {
    const feedbackId = projectFeedbacks[0]._id
    httpBackend.whenPUT(`${apihost}projects/${projectId}/feedbacks/${feedbackId}`, {
      comment: 'mock update feedback'
    })
      .respond({
        content: {
          comment: 'mock update feedback'
        }
      })

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

    FeedbackApi.updateProjectFeedback(projectId, feedbackId, {
      comment: 'mock update feedback'
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()
  })

  it('delete should ok', done => {
    const feedbackId = projectFeedbacks[0]._id

    httpBackend.whenDELETE(`${apihost}projects/${projectId}/feedbacks/${feedbackId}`)
      .respond({})

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

    FeedbackApi.deleteProjectFeedback(projectId, feedbackId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()
  })

  it('create should ok', done => {
    const mockFeedback = clone(projectFeedbacks[0])
    mockFeedback._id = 'mockFeedbackid'
    mockFeedback.content.comment = 'mock feedback post'

    httpBackend.whenPOST(`${apihost}projects/${projectId}/feedbacks`, {
      content: 'mock feedback post'
    })
      .respond(JSON.stringify(mockFeedback))

    FeedbackApi.getProjectFeedback(projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(2)
        expectDeepEqual(r[0], mockFeedback)
        done()
      })

    FeedbackApi.create(projectId, {
      content: 'mock feedback post'
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()
  })
})
