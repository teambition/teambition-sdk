'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
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
    FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .subscribe(r => {
        expectDeepEqual(r[0], projectFeedbacks[0])
        done()
      })
  })

  it('get projectFeedbacks from cache should ok', function* () {
    const signal = FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })

    yield signal.take(1)

    yield signal.take(1)
      .do(r => {
        expectDeepEqual(r[0], projectFeedbacks[0])
        expect(spy).to.be.calledOnce
      })
  })

  it('get projectFeedbacks page 2 should ok', function* () {
    httpBackend.whenGET(`${apihost}projects/${projectId}/feedbacks?count=1&page=2&from=${from}&to=${to}`)
      .respond(JSON.stringify(projectFeedbacks.slice(1)))

    const signal = FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .publish()
      .refCount()

    yield signal.take(1)

    yield FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 2,
      from, to
    })
      .take(1)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(2)
        expectDeepEqual(r[1], projectFeedbacks[1])
      })
  })

  it('get feedback in another day should ok', function* () {

    yield FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .take(1)

    to = new Date(2016, 12, 1).toISOString()
    httpBackend.whenGET(`${apihost}projects/${projectId}/feedbacks?count=1&page=1&from=${from}&to=${to}`)
      .respond(JSON.stringify(projectFeedbacks.slice(0, 1)))

    yield FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from, to
    })
      .take(1)
      .do(r => {
        expect(spy).to.be.calledTwice
      })

  })

  it('update project feedback should ok', function* () {
    const feedbackId = projectFeedbacks[0]._id
    httpBackend.whenPUT(`${apihost}projects/${projectId}/feedbacks/${feedbackId}`, {
      comment: 'mock update feedback'
    })
      .respond({
        content: {
          comment: 'mock update feedback'
        }
      })

    const signal = FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .publish()
      .refCount()

    yield signal.take(1)

    yield FeedbackApi.updateProjectFeedback(<any>projectId, <any>feedbackId, {
      comment: 'mock update feedback'
    })

    yield signal.take(1)
      .do(r => {
        expect(r[0].content.comment).to.equal('mock update feedback')
      })
  })

  it('delete should ok', function* () {
    const feedbackId = projectFeedbacks[0]._id

    httpBackend.whenDELETE(`${apihost}projects/${projectId}/feedbacks/${feedbackId}`)
      .respond({})

    const signal = FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .publish()
      .refCount()

    yield signal.take(1)

    signal.skip(1)
      .subscribe(r => {
        expect(r).to.deep.equal([])
      })

    yield FeedbackApi.deleteProjectFeedback(<any>projectId, <any>feedbackId)
  })

  it('create should ok', function* () {
    const mockFeedback = clone(projectFeedbacks[0])
    mockFeedback._id = 'mockFeedbackid'
    mockFeedback.content.comment = 'mock feedback post'

    httpBackend.whenPOST(`${apihost}projects/${projectId}/feedbacks`, {
      content: 'mock feedback post'
    })
      .respond(JSON.stringify(mockFeedback))

    const signal = FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .publish()
      .refCount()

    yield signal.take(1)

    yield FeedbackApi.create(<any>projectId, {
      content: 'mock feedback post'
    })

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(2)
        expectDeepEqual(r[0], mockFeedback)
      })
  })

  it('create feedback and all feedbacks collections should ok', function* () {
    const mockFeedback = clone(projectFeedbacks[0])
    mockFeedback._id = 'mockFeedbackid'
    mockFeedback.content.comment = 'mock feedback post'

    const lastYearFrom = new Date(2014, 1, 1).toISOString()
    const lastYearTo = new Date(2014, 12, 30).toISOString()

    httpBackend.whenGET(`${apihost}projects/${projectId}/feedbacks?count=1&page=1&from=${lastYearFrom}&to=${lastYearTo}`)
      .respond([])

    httpBackend.whenPOST(`${apihost}projects/${projectId}/feedbacks`, {
      content: 'mock feedback post'
    })
      .respond(JSON.stringify(mockFeedback))

    const signal = FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from: from,
      to: to
    })
      .publish()
      .refCount()

    const signal1 = FeedbackApi.getProjectFeedback(<any>projectId, {
      count: 1,
      page: 1,
      from: lastYearFrom,
      to: lastYearTo
    })
      .publish()
      .refCount()

    yield [
      signal.take(1),
      signal1.take(1)
    ]

    yield FeedbackApi.create(<any>projectId, {
      content: 'mock feedback post'
    })

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(2)
        expectDeepEqual(r[0], mockFeedback)
      })

    yield signal1.take(1)
      .do(r => {
        expect(r.length).to.equal(0)
      })
  })
})
