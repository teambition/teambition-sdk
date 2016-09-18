'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import { Scheduler } from 'rxjs'
import { Backend, EntrycategoryAPI, apihost, forEach, clone, BaseFetch } from '../index'
import { entrycategories } from '../../mock/entrycategories'
import { expectDeepEqual, flush, notInclude } from '../utils'

const expect = chai.expect

export default describe('entrycategory api test: ', () => {
  let httpBackend: Backend
  let EntrycategoryApi: EntrycategoryAPI
  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    EntrycategoryApi = new EntrycategoryAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  describe('get project entrycategories: ', () => {
    const projectId = entrycategories[0]._projectId

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}entrycategories?_projectId=${projectId}&page=1&count=20`)
        .respond(JSON.stringify(entrycategories))
    })

    it('get should ok', done => {
      EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      }).subscribe(results => {
        forEach(results, (entrycategory, index) => {
          expectDeepEqual(entrycategory, entrycategories[index])
        })
        done()
      }, err => console.error(err))
    })

    it('get from cache should ok', done => {
      EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      }).subscribe()

      EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(results => {
          forEach(results, (entrycategory, index) => {
            expectDeepEqual(entrycategory, entrycategories[index])
          })
          expect(spy).to.be.calledOnce
          done()
        })
    })

    it('add new entrycategory should ok', done => {
      const mockPost = clone(entrycategories[0])
      const mockId = 'entrycategorymockid'
      mockPost._id = mockId

      httpBackend.whenGET(`${apihost}entrycategories/${mockId}?_projectId=${projectId}`)
        .respond(JSON.stringify(mockPost))

      EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(results => {
          expect(results.length).to.equal(entrycategories.length + 1)
          done()
        })

      EntrycategoryApi.get(mockId, {
        _projectId: projectId
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()
    })

    it('delete entrycategory should ok', done => {
      const deleteId = entrycategories[0]._id

      httpBackend.whenDELETE(`${apihost}entrycategories/${deleteId}`)
        .respond({})

      EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(results => {
          notInclude(results, entrycategories[0])
          expect(results.length).to.equal(entrycategories.length - 1)
          done()
        })

      EntrycategoryApi.delete(deleteId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()
    })

  })

  it('update title should ok', done => {
    const testEntrycategory = clone(entrycategories[0])
    const testEntrycategoryId = testEntrycategory._id
    const projectId = testEntrycategory._projectId
    const mockResponse = {
      _id: testEntrycategoryId,
      updated: new Date().toISOString(),
      title: 'new title'
    }

    httpBackend.whenGET(`${apihost}entrycategories/${testEntrycategoryId}?_projectId=${projectId}`)
      .respond(JSON.stringify(testEntrycategory))

    httpBackend.whenPUT(`${apihost}entrycategories/${testEntrycategoryId}`, {
      title: 'new title'
    })
      .respond(JSON.stringify(mockResponse))

    EntrycategoryApi.get(testEntrycategoryId, {
      _projectId: projectId
    })
      .skip(1)
      .subscribe(result => {
        expect(result.title).to.equal('new title')
      })

    EntrycategoryApi.update(testEntrycategoryId, {
      title: 'new title'
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(r).to.deep.equal(mockResponse)
        done()
      })
  })

})
