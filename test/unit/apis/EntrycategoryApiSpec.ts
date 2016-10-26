'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
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
      })
        .subscribe(results => {
          forEach(results, (entrycategory, index) => {
            expectDeepEqual(entrycategory, entrycategories[index])
          })
          done()
        })
    })

    it('get from cache should ok', function* () {
      yield EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      })
        .take(1)

      yield EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      })
        .take(1)
        .do(results => {
          forEach(results, (entrycategory, index) => {
            expectDeepEqual(entrycategory, entrycategories[index])
          })
          expect(spy).to.be.calledOnce
        })
    })

    it('add new entrycategory should ok', function* () {
      const mockPost = clone(entrycategories[0])
      const mockId = 'entrycategorymockid'
      mockPost._id = <any>mockId

      httpBackend.whenGET(`${apihost}entrycategories/${mockId}?_projectId=${projectId}`)
        .respond(JSON.stringify(mockPost))

      const signal = EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield EntrycategoryApi.get(<any>mockId, {
        _projectId: projectId
      })
        .take(1)

      yield signal.take(1)
        .do(results => {
          expect(results.length).to.equal(entrycategories.length + 1)
        })

    })

    it('delete entrycategory should ok', function* () {
      const deleteId = entrycategories[0]._id

      httpBackend.whenDELETE(`${apihost}entrycategories/${deleteId}`)
        .respond({})

      const signal = EntrycategoryApi.getEntrycategories({
        _projectId: projectId,
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield EntrycategoryApi.delete(deleteId)

      yield signal.take(1)
        .do(results => {
          notInclude(results, entrycategories[0])
          expect(results.length).to.equal(entrycategories.length - 1)
        })
    })

  })

  it('update title should ok', function* () {
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

    const signal = EntrycategoryApi.get(testEntrycategoryId, {
      _projectId: projectId
    })
      .publish()
      .refCount()

    yield signal.take(1)

    yield EntrycategoryApi.update(testEntrycategoryId, {
      title: 'new title'
    })
      .take(1)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(result => {
        expect(result.title).to.equal('new title')
      })
  })

})
