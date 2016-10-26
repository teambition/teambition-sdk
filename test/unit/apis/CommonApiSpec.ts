'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { Backend, apihost, TaskAPI, BaseFetch } from '../index'
import { flush } from '../utils'

const expect = chai.expect
chai.use(SinonChai)

export default describe('common api test: ', () => {
  let httpBackend: Backend
  let TaskApi: TaskAPI
  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    TaskApi = new TaskAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  it('error response should ok', done => {
    httpBackend.whenGET(`${apihost}tasks/mock`)
      .error('Unauthorize', 401)

    TaskApi.get(<any>'mock')
      .retry(2)
      .subscribe({
        error: () => {
          expect(spy).to.be.calledThrice
          done()
        }
      })
  })

  it('retry should ok', done => {
    httpBackend.whenGET(`${apihost}tasks/mock`)
      .error('Unauthorize', 401)

    httpBackend.whenGET(`${apihost}tasks/mock`)
      .error('Unauthorize', 401)

    httpBackend.whenGET(`${apihost}tasks/mock`)
      .respond({
        _id: 'xxx'
      })

    TaskApi.get(<any>'mock')
      .retry(2)
      .subscribe(r => {
        expect(r._id).to.equal('xxx')
        expect(spy).to.be.calledThrice
        done()
      })
  })

  it('retry collection should ok', done => {
    httpBackend.whenGET(`${apihost}tasklists/tasklistId/tasks?isDone=false`)
      .error('Unauthorize', 401)

    httpBackend.whenGET(`${apihost}tasklists/tasklistId/tasks?isDone=false`)
      .error('Unauthorize', 401)

    httpBackend.whenGET(`${apihost}tasklists/tasklistId/tasks?isDone=false`)
      .respond([{
        _id: 'xxx'
      }])

    TaskApi.getTasklistUndone(<any>'tasklistId')
      .retry(2)
      .subscribe({
        next: (v: any[]) => {
          expect(spy).to.be.calledThrice
          expect(v.length).to.equal(1)
          done()
        }
      })
  })

  it('empty collection should not cached', function* () {
    httpBackend.whenGET(`${apihost}tasklists/tasklistId/tasks?isDone=false`)
      .respond([])

    yield TaskApi.getTasklistUndone(<any>'tasklistId')
      .take(1)

    yield TaskApi.getTasklistUndone(<any>'tasklistId')
      .take(1)

    expect(spy).to.be.calledTwice
  })
})
