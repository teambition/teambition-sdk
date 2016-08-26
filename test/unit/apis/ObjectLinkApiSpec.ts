'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { Backend, apihost, ObjectLinkAPI, BaseFetch, forEach, clone } from '../index'
import { objectLinks } from '../../mock/objectLinks'
import { notInclude, flush, expectDeepEqual } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('ObjectLink API test:', () => {
  let ObjectLink: ObjectLinkAPI
  let httpBackend: Backend
  let spy: Sinon.SinonSpy

  const parentId = objectLinks[0]._parentId
  const parentType = objectLinks[0].parentType

  beforeEach(() => {
    flush()

    ObjectLink = new ObjectLinkAPI()
    httpBackend = new Backend()
    spy = sinon.spy(BaseFetch.fetch, 'get')

    httpBackend.whenGET(`${apihost}v2/${parentType}s/${parentId}/objectlinks`)
      .respond(JSON.stringify(objectLinks))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  it('get objectLinks should ok', done => {
    ObjectLink.get(parentId, <any>parentType)
      .subscribe(r => {
        forEach(r, (val, index) => {
          expectDeepEqual(val, objectLinks[index])
        })
        done()
      })

    httpBackend.flush()
  })

  it('create objectlink should ok', done => {
    const mockObjectLink = clone(objectLinks[0])
    const createOptions = {
      _parentId: parentId,
      parentType: <any>parentType,
      _linkedId: 'mocklinkid',
      linkedType: 'weibo'
    }
    mockObjectLink.linkedType = createOptions.linkedType
    mockObjectLink._linkedId = createOptions._linkedId
    mockObjectLink._id = 'mockobjectlinkid'

    httpBackend.whenPOST(`${apihost}objectlinks`, createOptions)
      .respond(JSON.stringify(mockObjectLink))

    ObjectLink.get(parentId, <any>parentType)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(objectLinks.length + 1)
        expectDeepEqual(r[0], mockObjectLink)
        done()
      })

    ObjectLink.create(createOptions)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('delete objectlink should ok', done => {
    const objectlinkId = objectLinks[0]._id
    httpBackend.whenDELETE(`${apihost}objectlinks/${objectlinkId}`)
      .respond({})

    ObjectLink.get(parentId, <any>parentType)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(objectLinks.length - 1)
        expect(notInclude(r, objectLinks[0]))
        done()
      })

    ObjectLink.delete(objectlinkId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })
})
