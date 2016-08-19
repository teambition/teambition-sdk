'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { Backend, SubscribeAPI, apihost, BaseFetch } from '../index'
import { flush, expectDeepEqual } from '../utils'
import { orgsSubscribe } from '../../mock/orgsSubscribe'

const expect = chai.expect
chai.use(SinonChai)

export default describe('SubscribeApiSpec: ', () => {
  let httpBackend: Backend
  let SubscribeApi: SubscribeAPI
  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    SubscribeApi = new SubscribeAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')

    httpBackend.whenGET(`${apihost}subscribers/report?_organizationId=mock`)
      .respond(JSON.stringify(orgsSubscribe))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  it('get organization subscribe should ok', done => {

    SubscribeApi.getOrgsSubscribe('mock')
      .subscribe(r => {
        expectDeepEqual(r, orgsSubscribe)
        done()
      })

    httpBackend.flush()
  })

  it('get organization subscribe from cache should ok', done => {
    SubscribeApi.getOrgsSubscribe('mock')
      .subscribe()

    SubscribeApi.getOrgsSubscribe('mock')
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expectDeepEqual(r, orgsSubscribe)
        expect(spy).to.be.calledOnce
        done()
      })

    httpBackend.flush()
  })

  it('update organization subscribe should ok', done => {
    const mockprojects = orgsSubscribe.body.projects.concat([{
      _id: 'mockprojectid',
      name: 'mockprojectId',
      logo: 'logo',
      py: 'mockproject',
      pinyin: 'mockproject'
    }])

    httpBackend.whenPUT(`${apihost}subscribers/report?_organizationId=mock`, {
      $add: {
        'body.projects': ['mockprojectid']
      }
    })
      .respond({
        _id: orgsSubscribe._id,
        body: {
          projects: mockprojects
        }
      })

    SubscribeApi.getOrgsSubscribe('mock')
      .skip(1)
      .subscribe(r => {
        expect(r.body.projects).to.deep.equal(mockprojects)
        done()
      })

    SubscribeApi.updateOrgsSubscribe('mock', ['mockprojectid'])
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

})
