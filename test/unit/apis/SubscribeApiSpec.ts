'use strict'
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

    SubscribeApi.getOrgsSubscribe(<any>'mock')
      .subscribe(r => {
        expectDeepEqual(r, orgsSubscribe)
        done()
      })
  })

  it('get organization subscribe from cache should ok', function* () {
    yield SubscribeApi.getOrgsSubscribe(<any>'mock')
      .take(1)

    yield SubscribeApi.getOrgsSubscribe(<any>'mock')
      .take(1)
      .do(r => {
        expectDeepEqual(r, orgsSubscribe)
        expect(spy).to.be.calledOnce
      })
  })

  it('add project to organization subscribe should ok', function* () {
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

    const signal = SubscribeApi.getOrgsSubscribe(<any>'mock')
      .publish()
      .refCount()

    yield signal.take(1)

    yield SubscribeApi.updateOrgsSubscribe(<any>'mock', <any>['mockprojectid'])

    yield signal.take(1)
      .do(r => {
        expect(r.body.projects).to.deep.equal(mockprojects)
      })
  })

  it('remove project to organization subscribe should ok', function* () {
    const mockprojects = []

    httpBackend.whenPUT(`${apihost}subscribers/report?_organizationId=mock`, {
      $del: {
        'body.projects': ['mockprojectid']
      }
    })
      .respond({
        _id: orgsSubscribe._id,
        body: {
          projects: mockprojects
        }
      })

    const signal = SubscribeApi.getOrgsSubscribe(<any>'mock')
      .publish()
      .refCount()

    yield signal.take(1)

    yield SubscribeApi.updateOrgsSubscribe(<any>'mock', null, <any>['mockprojectid'])

    yield signal.take(1)
      .do(r => {
        expect(r.body.projects).to.deep.equal(mockprojects)
      })
  })

})
